const addToLineup = (lineup, player) => {
    if (lineup.indexOf(player) !== -1) {
        return null;
    }
    for (let i = 0; i < lineup.length; i++) {
        const unknownPlayer = lineup[i].match(/^..unknown_(\d+)$/)
        if (unknownPlayer !== null) {
            lineup[i] = player;
            return Number(unknownPlayer[1])
        }
    }
    return null;
}

const subLineup = (lineup, subIn, subOut) => {
    let subbed = 0;
    let lineupCopy = [...lineup];
    for (let i = 0; i < lineup.length; i++) {
        if (lineup[i] === subOut) {
            lineup[i] = subIn;
            subbed++;
        }
    }
    if (subbed !== 1) {
        //console.log(`Error: Attempting to sub ${subIn} for ${subOut} in lineup ${lineupToStr(lineup)}`);
    }
}

const lineupToStr = lineup => lineup.map(x => x.replace(/[',\-\.\s]/g, '')).sort().join('+')

const processGame = data => {
    const { score_sub, basic } = data;
    let table = []

    let homeLineup = basic.home.starters;
    let awayLineup = basic.away.starters; 
    let matchupStart = 0;

    let lastQuarter = '1';

    let homeUnknownList = []
    let awayUnknownList = []

    let homeScore = 0;
    let awayScore = 0;

    score_sub.forEach(entry => {
        const { event, time, prettyTime } = entry;
        const { team, type, points, player, subIn, subOut } = event;

        if (prettyTime[0] !== lastQuarter) {
            let duration = time - matchupStart;
            table.push([
                lineupToStr(homeLineup),
                lineupToStr(awayLineup),
                homeScore,
                awayScore,
                duration
            ])

            homeScore = 0;
            awayScore = 0;
            matchupStart = time;
                    
            lastQuarter = prettyTime[0]
            let homeUnknownIndex = homeUnknownList.length;
            let awayUnknownIndex = awayUnknownList.length;
            for (let i = 0; i < 5; i++) {
                homeLineup[i] = `h_unknown_${homeUnknownIndex + i}`
                awayLineup[i] = `a_unknown_${awayUnknownIndex + i}`
            }
        }

        if (event.type === 'turnover') {
            return;
        }

        if (event.type === 'switch') {
            if (!subIn || !subOut) {
                return;
            }
        }

        if (event.type !== 'switch') {
            if (team === 'HOME') {
                let unknown = addToLineup(homeLineup, player);
                if (unknown !== null) {
                    homeUnknownList[unknown] = player;
                }
            } else {
                let unknown = addToLineup(awayLineup, player);
                if (unknown !== null) {
                    awayUnknownList[unknown] = player;
                }
            }
        } else {
            if (team === 'HOME') {
                let unknown = addToLineup(homeLineup, subOut);
                if (unknown !== null) {
                    homeUnknownList[unknown] = subOut;
                }
            } else {
                let unknown = addToLineup(awayLineup, subOut);
                if (unknown !== null) {
                    awayUnknownList[unknown] = subOut;
                }
            }
        }
        
        // process.stdout.write(`${prettyTime}:\t`)

        if (event.type === 'score') {
            //console.log(`${player} scored ${points} points`);
            if (team === 'HOME') {
                homeScore += points
            } else {
                awayScore += points
            }
        } else if (event.type === 'switch') {
            let duration = time - matchupStart;
            table.push([
                lineupToStr(homeLineup),
                lineupToStr(awayLineup),
                homeScore,
                awayScore,
                duration
            ])

            homeScore = 0;
            awayScore = 0;
            matchupStart = time;

            if (team === 'HOME') {
                subLineup(homeLineup, subIn, subOut)
            } else {
                subLineup(awayLineup, subIn, subOut)
            }
        }
    })

    table = table.filter(entry => entry[4] !== 0).map(entry => {
        console.log(entry[0])
        for (let i = homeUnknownList.length - 1; i >= 0; i--) {
            entry[0] = entry[0].replace(`h_unknown_${i}`, homeUnknownList[i].replace(/[',\-\.\s]/g, ''))
        }
        console.log(entry[1])
        for (let i = awayUnknownList.length - 1; i >= 0; i--) {
            entry[1] = entry[1].replace(`a_unknown_${i}`, awayUnknownList[i].replace(/[',\-\.\s]/g, ''))
        }
        return entry;
    })

    return table;
}

module.exports = processGame;