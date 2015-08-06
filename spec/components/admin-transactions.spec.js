describe('AdminTransaction component', function() {
  var c = window.c;

  beforeAll(function(){
    contribution = m.prop(ContributionDetailMockery(1, {gateway_data: null}));
    detailedBox = m.component(c.AdminTransaction,  {contribution: contribution()[0]});
    view = detailedBox.view(ctrl, {contribution: contribution});
    $output = mq(view);
  });

  describe('view', function() {
    it('should render details about contribution', function() {
      expect($output.contains('Valor: R$50,00')).toBeTrue();
      expect($output.contains('Meio: MoIP')).toBeTrue();
    });
  });
});
