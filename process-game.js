const lineup = team => team.map(x => (x || "Unknown").split(' ').join('')).sort().join('+');
const newMatchup = (away, home, time, awayScore, homeScore) => ({ away: lineup(away), home: lineup(home), time, awayScore, homeScore });
const addMatchup = (byHome, matchup) => {
    const { away, home, time, awayScore, homeScore } = matchup;
    if (byHome.hasOwnProperty(home)) {
        if (byHome[home].hasOwnProperty(away)) {
            byHome[home][away].time += time;
            byHome[home][away].awayScore += awayScore;
            byHome[home][away].homeScore += homeScore;
        } else {
            byHome[home][away] = { time, awayScore, homeScore } 
        }
    } else {
        byHome[home] = {
            [away]: { time, awayScore, homeScore }
        }
    }

    return byHome;
}

const processGame = data => {
    const { score_sub, basic } = data;
    let byHome = {};

    let home = basic.home.starters;
    let away = basic.away.starters;
    let matchupTime = 0;
    let awayPoints = 0;
    let homePoints = 0;

    let awayUnknowns = 0;
    let awayUnknown = []
    let homeUnknowns = 0;
    let homeUnknown = []

    let table = [];

    score_sub.forEach(entry => {
        const { event, time, prettyTime } = entry;
        const { type, team, points, player, subIn, subOut } = event;

        process.stdout.write(`${prettyTime}: `);

        if (type === 'score') {
            //console.log(`${player} scored ${points} points`);
            if (team === 'AWAY') {
                if (away.indexOf(player) === -1) {
                    //console.log(`   Error: ${player} scored but not in lineup`)
                    let index = away.indexOf(`away_unknown_${awayUnknowns - 1}`)
                    if (index !== -1) {
                        away[index] = player; 
                        //console.log(`   Guess: It was ${player}`)
                    }
                    awayUnknown.push(player)
                }
                awayPoints += points 
            } else {
                if (home.indexOf(player) === -1) {
                    //console.log(`   Error: ${player} scored but not in lineup`)
                    let index = home.indexOf(`home_unknown_${homeUnknowns - 1}`)
                    if (index !== -1) {
                        home[index] = player; 
                        //console.log(`   Guess: It was ${player}`)
                    }
                    homeUnknown.push(player)
                }
                homePoints += points 
            }
        } else if (type === 'switch') {
            const length = time - matchupTime;
            const matchup = newMatchup(away, home, length, awayPoints, homePoints);
            table.push(matchup)
            // byHome = addMatchup(byHome, matchup)

            matchupTime = time;
            awayPoints = 0;
            homePoints = 0;


            if (team === 'AWAY') {
                let swapped = false;
                for (let i = 0; i < away.length; i++) {
                    if (away[i] === subIn) {
                        //console.log(`Subbing ${subIn} for ${subOut}...`)
                        //console.log(`   Error: ${subIn} already in lineup`);
                        //console.log(`   Current lineup: ${away.join('-')}`)
                    }
                    if (away[i] === subOut) {
                        away[i] = subIn;
                        if (away[i] === null) {
                            //console.log("Unknown away player subbed in");
                            away[i] = `away_unknown_${awayUnknowns}`
                            awayUnknowns++;
                        }
                        //console.log(`Subbed ${subIn} for ${subOut} at index ${i}`)
                        swapped = true;
                    }
                }    
                if (!swapped) {
                    //console.log(`Subbing ${subIn} for ${subOut}...`)
                    //console.log(`   Error: ${subOut} not in lineup`);
                    let index = away.indexOf(`away_unknown_${awayUnknowns - 1}`)
                    if (index !== -1) {
                        away[index] = awayUnknown[awayUnknowns - 1] || subIn; 
                        //console.log(`   Guess: It was ${away[index]}`)
                    }
                    //console.log(`   Current lineup: ${away.join('-')}`)
                }
            } else {
                let swapped = false;
                for (let i = 0; i < home.length; i++) {
                    if (home[i] === subIn) {
                        //console.log(`Subbing ${subIn} for ${subOut}...`)
                        //console.log(`   Error: ${subIn} already in lineup`);
                        //console.log(`   Current lineup: ${home.join('-')}`)
                    }
                    if (home[i] === subOut) {
                        home[i] = subIn;
                        if (home[i] === null) {
                            //console.log("Unknown home player subbed in");
                            home[i] = `home_unknown_${homeUnknowns}`
                            homeUnknowns++;
                        }
                        //console.log(`Subbed ${subIn} for ${subOut} at index ${i}`)
                        swapped = true;
                    }
                }                
                if (!swapped) {
                    //console.log(`Subbing ${subIn} for ${subOut}...`)
                    //console.log(`   Error: ${subOut} not in lineup`);
                    let index = home.indexOf(`home_unknown_${homeUnknowns - 1}`)
                    if (index !== -1) {
                        home[index] = homeUnknown[homeUnknowns - 1] || subIn; 
                        //console.log(`   Guess: It was ${home[index]}`)
                    }
                    //console.log(`   Current lineup: ${home.join('-')}`)
                }
            }
        }
    })

    let finalTime = (4 * 12 * 60);
    while (finalTime < matchupTime) {
        finalTime += (5 * 60);
    }

    const length = finalTime - matchupTime;
    const matchup = newMatchup(away, home, length, awayPoints, homePoints);
    table.push(matchup)

    table = table.filter(entry => entry.time !== 0).map(entry => { 
        let { home, away } = entry;
        for (let i = 0; i < awayUnknowns; i++) {
            away = away.replace(`away_unknown_${i}`, awayUnknown[i])
        }
        for (let i = 0; i < homeUnknowns; i++) {
            home = home.replace(`home_unknown_${i}`, homeUnknown[i])
        }
        home = home.split('+').sort().join('+')
        away = away.split('+').sort().join('+')
        return {
            home,
            away,
            ...entry
        }
    }).map(entry => `${entry.home},${entry.away},${entry.homeScore},${entry.awayScore},${entry.time}`).join('\n')

    // byHome = addMatchup(byHome, matchup)    

    // Object.keys(byHome).forEach(home => {
    //     Object.keys(byHome[home]).forEach(away => {
    //         const { time, awayScore, homeScore } = byHome[home][away];
    //         for (let i = 0; i < awayUnknowns; i++) {
    //             away = away.replace(`away-unknown-${i}`, awayUnknown[i])
    //         }
    //         for (let i = 0; i < homeUnknowns; i++) {
    //             home = home.replace(`home-unknown-${i}`, homeUnknown[i])
    //         }
    //         if (time > 0) {
    //             table.push({ home, away, time, awayScore, homeScore });
    //         }
    //     })
    // })

    return table;
}

module.exports = processGame;