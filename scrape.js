const gameids = require('./gameids');
const getPBP = require('./pbp');
const { asyncForEach } = require('./lib');
const fs = require('fs');

const writeCb = results => {
    fs.writeFileSync(`data/${gameid}.json`, JSON.stringify(results, null, 2), 'utf8');
}

getPBP(gameids, writeCb);

return;