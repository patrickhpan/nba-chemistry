const _ = require('date-fns');
const puppeteer = require('puppeteer');
const {
    toSeconds,
    toPrettyTime,
    asyncForEach
} = require('./lib');
const fs = require('fs');
const csvstr = require('csv-stringify/lib/sync');
const processGame = require('./process-game');

let _browser;
try {
    _browser = require('./_browser');
} catch (e) {
    _browser = {
        headless: true
    };
}

const dateUrl = datestr => `http://www.espn.com/nba/schedule/_/date/${datestr}`
const toURL = gameid => `http://www.espn.com/nba/playbyplay?gameId=${gameid}`

const scrapePBPs = async (afterDate, beforeDate = new Date()) => {

    const browser = await puppeteer.launch(_browser);

    const datePage = await browser.newPage()
    await datePage.setRequestInterception(true);
    datePage.on('request', interceptedRequest => {
        if (interceptedRequest.url().endsWith('.js')) {
            interceptedRequest.abort();
        } else {
            interceptedRequest.continue();
        }
    });
    await datePage.setViewport({
        width: 1000,
        height: 2000
    })

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
        if (interceptedRequest.url().endsWith('.js')) {
            interceptedRequest.abort();
        } else {
            interceptedRequest.continue();
        }
    });
    await page.setViewport({
        width: 1000,
        height: 2000
    })

    beforeDate = _.subDays(beforeDate, 7);
    while (_.isAfter(beforeDate, afterDate)) {
        let dateStr = _.format(beforeDate, "YYYYMMDD");
        const url = dateUrl(dateStr);
        await datePage.goto(url);
        await datePage.addScriptTag({
            path: './lib.js'
        })

        let gameids = await datePage.evaluate(() => {
            const ids = selectAll('a[name="&lpos=nba:schedule:score"]').map(x => x.href.slice(-9))
            return ids
        })

        await asyncForEach(gameids, async gameid => {

            console.log(`${gameid} start`)

            const url = toURL(gameid);
            await page.goto(url);
            await page.addScriptTag({
                path: './lib.js'
            })

            let result = await page.evaluate(() => {
                let [away, home] = selectAll("td.team-name").map(x => x.innerText);

                let starters = selectAll('ul.playerfilter li:nth-child(-n+6):not(:first-child').map(x => x.innerText);

                let basic = {
                    away: {
                        team: away,
                        starters: starters.slice(0, 5)
                    },
                    home: {
                        team: home,
                        starters: starters.slice(5, 10)
                    },
                    date: new Date(document.body.innerHTML.match(/espn\.gamepackage\.timestamp = "([^"]+)"/)[1]).toISOString().slice(0, 10).replace(/-/g, ""),
                    gameid: document.body.innerHTML.match(/espn\.gamepackage\.gameId = "([^"]+)"/)[1]
                }

                let bodies = selectAll('#gamepackage-qtrs-wrap tbody');

                let score_sub = [];
                let pbp = [];
                bodies.forEach((body, q) => {
                    let rows = AA(body.children);
                    rows.forEach(row => {
                        const tds = AA(row.children);

                        const {
                            0: timeEl,
                            1: logoEl,
                            2: detailEl,
                            3: scoreEl
                        } = tds;

                        let event = processDetail(detailEl);
                        if (event === null) {
                            return;
                        }

                        const [m, s] = processTimeEl(timeEl);
                        const time = toSeconds(q + 1, m, s);
                        const prettyTime = toPrettyTime(time);
                        const team = logoToTeam(logoEl) === away ? 'AWAY' : 'HOME';
                        const score = processScoreEl(scoreEl);

                        score_sub.push({
                            time,
                            prettyTime,
                            score,
                            event: {
                                team,
                                ...event
                            }
                        })

                        pbp.push({
                            time,
                            prettyTime,
                            score,
                            event: detailEl.innerText
                        })
                    })
                })

                return {
                    basic,
                    score_sub,
                    pbp
                }
            })

            const date = result.basic.date;
            const away = result.basic.away.team;
            const home = result.basic.home.team;
            const name = `${date}-${away}-${home}`
            fs.writeFileSync(`data/${name}.json`, JSON.stringify(result, null, 2), 'utf8');
            // const table = processGame(result)
            // const output = csvstr(table);
            // fs.writeFileSync(`csv/${name}.csv`, output, 'utf8');

            console.log(`${gameid} (${name}) success!`);
            return;
        })

        beforeDate = _.subDays(beforeDate, 7);
    }

    await datePage.close()
    await page.close()
    await browser.close()

    return;
}

module.exports = scrapePBPs;