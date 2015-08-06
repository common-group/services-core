describe('TeamTotal', function() {
  var TeamTotal = window.c.TeamTotal;

  describe('view', function() {
    beforeAll(function() {
      $output = mq(TeamTotal);
    });

    it('should render fetched team total info', function() {
      expect($output.find('#team-total-static').length).toEqual(1);
    });
  });
});

