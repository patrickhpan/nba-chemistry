const assert = require('assert');
const { toSeconds, toPrettyTime } = require('../lib');

describe('toPrettyTime', () => {
    it('should convert time 0 to 1Q 12:00', () => {
        assert.equal(toPrettyTime(0), "1Q 12:00");
    })

    it('should convert time 1000 to 2Q 07:20', () => {
        assert.equal(toPrettyTime(1000), "2Q 07:20");
    })

    it('should convert time 2880 to 4Q 00:00', () => {
        assert.equal(toPrettyTime(2880), "4Q 00:00");
    })

    it('should convert time 3645 to 3OT 02:15', () => {
        assert.equal(toPrettyTime(3645), "3OT 02:15");
    })
})

describe('toSeconds', () => {
    it('should convert 1Q 12:00 to time 0', () => {
        assert.equal(toSeconds(1, 12, 0), 0);
    })

    it('should convert 2Q 07:20 to time 1000', () => {
        assert.equal(toSeconds(2, 7, 20), 1000);
    })

    it('should convert 4Q 00:00 to time 2880', () => {
        assert.equal(toSeconds(4, 0, 0), 2880);
    })

    it('should convert 7Q 02:15 to time 3645', () => {
        assert.equal(toSeconds(7, 2, 15), 3645);
    })

})