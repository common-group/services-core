describe("adminApp initialization", function(){
  it("should initialize adminApp in browser window", function(){
    expect(window.adminApp).toEqual(jasmine.any(Object))
  });
  it("should initialize mithril.postgrest", function(){
    expect(m.postgrest).toEqual(jasmine.any(Object));
  });
});
