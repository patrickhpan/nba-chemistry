// const gameids = require('./gameids');
// const getPBP = require('./pbp');
// const { asyncForEach } = require('./lib');
// const fs = require('fs');
// const csvstr = require('csv-stringify/lib/sync');
// const processGame = require('./process-game');

// const writeCb = (gameid, results) => {
//     fs.writeFileSync(`data/${gameid}.json`, JSON.stringify(results, null, 2), 'utf8');
//     const table = processGame(results)
//     const output = csvstr(table);
//     fs.writeFileSync(`csv/${game}.csv`, output, 'utf8');
// }

// getPBP(gameids, writeCb);
const _ = require('date-fns');
const scrapePBPs = require('./pbp');
for(let i = 365; i < 1707; i += 365) {
    scrapePBPs(
        _.subDays(_.endOfToday(), 1707),
        _.subDays(_.endOfToday(), i),
    )
}