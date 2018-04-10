const puppeteer = require('puppeteer');
const { toSeconds, toPrettyTime, asyncForEach } = require('./lib');

const toURL = gameid => `http://www.espn.com/nba/playbyplay?gameId=${gameid}`

const getPBP = async (gameids, cb) => {
    gameids = (Array.isArray(gameids) ? gameids : [gameids]);

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    asyncForEach(gameids, async gameid => {
        const url = toURL(gameid);

        await page.setViewport({ width: 1000, height: 2000 })
        await page.goto(url);
        let result = await page.evaluate(() => {
            return 123;
        })
        await page.close()

        cb(result)
        return result;
    })
}

module.exports = getPBP;