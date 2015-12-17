describe("c initialization", function() {
    it("should initialize mithril.postgrest", function() {
        expect(m.postgrest).toEqual(jasmine.any(Object));
    });
});
