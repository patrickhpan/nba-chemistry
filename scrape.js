const gameids = require('./gameids');
const getPBP = require('./pbp');
const { asyncForEach } = require('./lib');
const fs = require('fs');
const csvstr = require('csv-stringify');
const processGame = require('./process-game');

const writeCb = (gameid, results) => {
    fs.writeFileSync(`data/${gameid}.json`, JSON.stringify(results, null, 2), 'utf8');

    const table = processGame(results)
    csvstr(table, (err, output) => {
        if (err) {
            console.error(err)
        } else {
            fs.writeFileSync(`csv/${gameid}.csv`, output, 'utf8');
        }
    })
}

getPBP(gameids, writeCb);