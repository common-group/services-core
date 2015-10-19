describe("c initialization", function() {
    it("should initialize pages in browser window", function() {
        expect(window.c.pages).toEqual(jasmine.any(Object));
    });

    it("should initialize admin in browser window", function() {
        expect(window.c.admin).toEqual(jasmine.any(Object));
    });

    it("should initialize mithril.postgrest", function() {
        expect(m.postgrest).toEqual(jasmine.any(Object));
    });
});
