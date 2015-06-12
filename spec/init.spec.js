describe("adminApp initialization", function(){
  it("should initialize adminApp in browser window", function(){
    expect(window.adminApp).toEqual(jasmine.any(Object))
  });
});
