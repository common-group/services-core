describe('AdminContributionsListPaymentDetailBoxDetailed component', function() {
  beforeAll(function(){
    contribution = m.prop(ContributionDetailMockery(1));
    detailedBox = m.component(adminApp.AdminContributionsListPaymentDetailBoxDetailed,  {contribution: contribution()[0]})
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

