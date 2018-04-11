const lineup = team => team.map(x => x.split(' ').join('')).sort().join('-');
const newMatchup = (away, home, time, awayScore, homeScore) => ({ away: lineup(away), home: lineup(home), time, awayScore, homeScore });
const addMatchup = (byHome, matchup) => {
    console.log(matchup)
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
    const { pbp, basic } = data;
    let byHome = {};

    let home = basic.home.starters;
    let away = basic.away.starters;
    let matchupTime = 0;
    let awayPoints = 0;
    let homePoints = 0;

    pbp.forEach(entry => {
        const { event, time } = entry;
        const { team, points, player, subIn, subOut } = event;
        if (points) {
            if (team === 'AWAY') {
                awayPoints += points 
            } else {
                homePoints += points 
            }
        } else {
            const length = time - matchupTime;
            const matchup = newMatchup(away, home, length, awayPoints, homePoints);
            byHome = addMatchup(byHome, matchup)

            matchupTime = time;
            awayPoints = 0;
            homePoints = 0;

            if (team === 'AWAY') {
                for (let i = 0; i < away.length; i++) {
                    if (away[i] === subOut) {
                        away[i] = subIn;
                    }
                }                
            } else {
                for (let i = 0; i < home.length; i++) {
                    if (home[i] === subOut) {
                        home[i] = subIn;
                    }
                }                
            }
        }
    })

    // const length = time - matchupTime;
    // const matchup = newMatchup(away, home, length, awayPoints, homePoints);
    // byHome = addMatchup(byHome, matchup)    

    let table = [];
    Object.keys(byHome).forEach(home => {
        Object.keys(byHome[home]).forEach(away => {
            const { time, awayScore, homeScore } = byHome[home][away];
            if (time > 0) {
                table.push({ home, away, time, awayScore, homeScore });
            }
        })
    })

    return table;
}

module.exports = processGame;