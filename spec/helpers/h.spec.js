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

