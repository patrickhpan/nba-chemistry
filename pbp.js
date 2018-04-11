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
        await page.setViewport({ width: 1000, height: 2000 })

        const url = toURL(gameid);
        await page.goto(url);
        await page.addScriptTag({ path: './lib.js' })

        let result = await page.evaluate(() => {
            let [away, home] = selectAll("td.team-name").map(x => x.innerText);

            let starters = selectAll('ul.playerfilter li:nth-child(-n+6):not(:first-child').map(x => x.innerText);

            let basic = {
                away: {
                    team: away,
                    starters: starters.slice(0,5)
                },
                home: {
                    team: home,
                    starters: starters.slice(5,10)
                },
            }

            let bodies = selectAll('#gamepackage-qtrs-wrap tbody');

            let pbp = [];
            bodies.forEach((body, q) => { 
                let rows = AA(body.children);
                rows.forEach(row => {
                    const tds = AA(row.children);

                    const { 0: timeEl, 1: logoEl, 2: detailEl, 3: scoreEl } = tds;

                    let event = processDetail(detailEl);
                    if (event === null) {
                        return;
                    }

                    const [m, s] = processTimeEl(timeEl);
                    const time = toSeconds(q + 1, m, s);
                    const team = logoToTeam(logoEl) === away ? 'AWAY' : 'HOME';
                    const score = processScoreEl(scoreEl);

                    pbp.push({
                        time,
                        prettyTime: toPrettyTime(time),
                        score,
                        event: { team, ...event }
                    })
                })
            })

            return {
                basic,
                pbp
            }
        })


        cb(gameid, result)
        return result;
    })

    await page.close()
    await browser.close()

    return;
}

module.exports = getPBP;