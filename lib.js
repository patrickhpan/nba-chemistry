class ScrapeError extends Error {
    constructor() {
        super();
        this.name = "ScrapeError";
    }
}

const select = (selector, name = selector) => {
    const el = document.querySelector(selector);
    if (el === null) {
        throw new ScrapeError(`${name} element not found`);
    }
}

const toSeconds = (q, m, s) => {
    if (q > 4) {
        return (4 * 12 * 60) + (q - 5) * (5 * 60) + (4 - m) * 60 + (60 - s);
    } else {
        return (q - 1) * (12 * 60) + (11 - m) * 60 + (60 - s); 
    }
}

const toPrettyTime = time => {
    let quarter = 1;
    while (quarter <= 4 && time > 12 * 60) {
        time -= 12 * 60;
        quarter++;
    }
    while (quarter > 4 && time > 5 * 60) {
        time -= 5 * 60;
        quarter++;
    }
    let overtime = quarter - 4;
    overtime = overtime > 0 ? overtime : 0;
    quarter -= overtime;
    let remaining = (overtime > 0) ?
        5 * 60 - time :
        12 * 60 - time
    let minute = ("0" + Math.floor(remaining / 60)).slice(-2);
    let second = ("0" + remaining % 60).slice(-2);
    return (overtime > 0) ? 
        `${overtime}OT ${minute}:${second}` :
        `${quarter}Q ${minute}:${second}`
}

const asyncForEach = async (arr, cb) => {
    for (let i = 0; i < arr.length; i++) {
        try {
            await cb(arr[i], i, arr);
        } catch (e) {
            console.error(e);
        }
    }
    console.log('async foreach done')
    return true;
}

module.exports = {
    select,
    toSeconds,
    toPrettyTime,
    asyncForEach
}


