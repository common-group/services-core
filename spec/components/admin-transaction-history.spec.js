describe('AdminTransactionHistory', function() {
  var c = window.c;

  beforeAll(function(){
    contribution = m.prop(ContributionDetailMockery(1));
    historyBox = m.component(c.AdminTransactionHistory,  {contribution: contribution()[0]});
    ctrl = historyBox.controller();
    view = historyBox.view(ctrl, {contribution: contribution});
    $output = mq(view);
  });

  describe('controller', function(){
    it("should have orderedEvents", function() {
      expect(ctrl.orderedEvents.length).toEqual(2);
    });

    it("should have formated the date on orderedEvents", function() {
      expect(ctrl.orderedEvents[0].date).toEqual('15/01/2015, 17:25');
    });
  });

  describe('view', function() {
    it('should render fetched orderedEvents', function() {
      expect($output.find('.date-event').length).toEqual(2);
    });
  });
});
