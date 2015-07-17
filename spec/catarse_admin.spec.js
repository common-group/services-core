describe("formatNumber", function(){
  var number = null;

  beforeAll(function(){
    number = 120.20
  });

  it("should format " + number, function(){
    expect(formatNumber(number)).toEqual('120')
    expect(formatNumber(number, 2, 3)).toEqual('120,20')
    expect(formatNumber(number, 2, 2)).toEqual('1.20,20')
  });
});
