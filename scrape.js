const _ = require('date-fns');
const scrapePBPs = require('./pbp');
for(let i = 0; i < 1707; i += 365) {
    scrapePBPs(
        _.subDays(_.endOfToday(), 1707),
        _.subDays(_.endOfToday(), i),
    )
}