const { toSeconds, toPrettyTime } = require('./lib');

for (let q = 1; q <= 6; q++) {
    for (let m = (q > 4 ? 4 : 11); m >= 0; m--) {
        for (let s = 59; s >= 0; s--) {
            console.log(toPrettyTime(toSeconds(q, m, s)));
        }
    }
}