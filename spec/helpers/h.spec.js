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
