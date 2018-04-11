const puppeteer = require('puppeteer');
const { toSeconds, toPrettyTime, asyncForEach } = require('./lib');
let _browser;
try { 
    _browser = require('./_browser');
} catch (e) {
    _browser = { headless: true };
}

const toURL = gameid => `http://www.espn.com/nba/playbyplay?gameId=${gameid}`

const getPBP = async (gameids, cb) => {
    gameids = (Array.isArray(gameids) ? gameids : [gameids]);

    const browser = await puppeteer.launch(_browser);
    const page = await browser.newPage();

    await asyncForEach(gameids, async gameid => {
        const url = toURL(gameid);

        await page.setViewport({ width: 1000, height: 2000 })
        await page.goto(url);
        await page.addScriptTag({ path: './lib.js' })

        let result = await page.evaluate(() => {
            let bodies = selectAll('#gamepackage-qtrs-wrap tbody');

            let a = [];
            bodies.forEach((body, q) => { 
                let rows = AA(body.children);
                rows.forEach(row => {
                    const tds = AA(row.children);

                    const { 0: timeEl, 1: logoEl, 2: textEl, 3: scoreEl } = tds;
                    const [m, s] = processTimeEl(timeEl);
                    const timestamp = toSeconds(q + 1, m, s);

                    a.push(timestamp);
                })
            })

            return a;
        })

        console.log(JSON.stringify(result, null, 2))

        await page.close()

        cb(gameid, result)
        return result;
    })

    await browser.close()

    return;
}

module.exports = getPBP;