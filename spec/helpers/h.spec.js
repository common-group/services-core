describe("h.formatNumber", function(){
  var number = null,
    formatNumber = window.c.h.formatNumber;

  it("should format number", function(){
    number = 120.20;
    expect(formatNumber(number)).toEqual('120');
    expect(formatNumber(number, 2, 3)).toEqual('120,20');
    expect(formatNumber(number, 2, 2)).toEqual('1.20,20');
  });
});

describe("h.splitRemaningTime", function(){
  var splitRemaningTime = window.c.h.splitRemaningTime;

  it("should return parsed time array", function(){
    expect(splitRemaningTime(null)).toEqual(['Invalid', 'date']);
    expect(splitRemaningTime(moment(new Date).subtract(3, 'days').toString())).toEqual(['2', 'days', 'ago']);
    expect(splitRemaningTime(moment(new Date).add(1, 'days'))).toEqual(['in', '2', 'days']);
  });
});
