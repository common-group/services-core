describe('models.teamTotal', function() {
  var models = window.c.models;

  describe('when instantiated', function() {
    beforeAll(function() {
      this.teamTotal= new models.teamTotal(this.teamTotalMock);
    });

    it('should exhibit attributes', function() {
      expect(this.teamTotal).toMatchPropertiesOf(this.teamTotalMock);
    });
  });
});

