describe("h.formatNumber", () => {
    let number = null,
        formatNumber = window.c.h.formatNumber;

    it("should format number", () => {
        number = 120.20;
        expect(formatNumber(number)).toEqual('120');
        expect(formatNumber(number, 2, 3)).toEqual('120,20');
        expect(formatNumber(number, 2, 2)).toEqual('1.20,20');
    });
});

describe('h.rewardSouldOut', () => {
    let reward = null,
        rewardSouldOut = window.c.h.rewardSouldOut;

    it('return true when reward already sould out', () => {
        reward = {
            maximum_contributions: 5,
            paid_count: 3,
            waiting_payment_count: 2
        };

        expect(rewardSouldOut(reward)).toEqual(true);
    });

    it('return false when reward is not sould out', () => {
        reward = {
            maximum_contributions: 5,
            paid_count: 3,
            waiting_payment_count: 1
        };

        expect(rewardSouldOut(reward)).toEqual(false);
    });

    it('return false when reward is not defined maximum_contributions', () => {
        reward = {
            maximum_contributions: null,
            paid_count: 3,
            waiting_payment_count: 1
        };

        expect(rewardSouldOut(reward)).toEqual(false);
    });
});

describe('h.rewardRemaning', () => {
    let reward,
        rewardRemaning = window.c.h.rewardRemaning;

    it('should return the total remaning rewards', () => {
        reward = {
            maximum_contributions: 10,
            paid_count: 3,
            waiting_payment_count: 2
        };

        expect(rewardRemaning(reward)).toEqual(5);
    });
});

describe('h.parseUrl', () => {
    let url,
        parseUrl = window.c.h.parseUrl;

    it('should create an a element', () => {
        url = 'http://google.com';
        expect(parseUrl(url).hostname).toEqual('google.com');
    });
});

describe('h.pluralize', () => {
    let count,
        pluralize = window.c.h.pluralize;

    it('should use plural when count greater 1', () => {
        count = 3;
        expect(pluralize(count, ' dia', ' dias')).toEqual('3 dias');
    });

    it('should use singular when count less or equal 1', () => {
        count = 1;
        expect(pluralize(count, ' dia', ' dias')).toEqual('1 dia');
    });
});