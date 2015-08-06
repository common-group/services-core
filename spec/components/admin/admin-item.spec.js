describe('AdminItem component', function() {
  var c = window.c,
      setController = function(contribution){
        ctrl = m.component(c.AdminItem, {contribution: contribution()[0]}).controller();
      };

  describe('controller', function(){
    beforeAll(function() {
      contribution = m.prop(ContributionDetailMockery(1));
      setController(contribution);
    });

    it('should have a stateClass function', function() {
      expect(ctrl.stateClass).toBeFunction();
    });
    it('should have a paymentMethodClass function', function() {
      expect(ctrl.paymentMethodClass).toBeFunction();
    });
    describe('stateClass function', function() {
      it('should return a success CSS class when contribution state is paid', function() {
        setController(m.prop(ContributionDetailMockery(1, {state: 'paid'})));
        expect(ctrl.stateClass()).toEqual('.text-success');
      });
      it('should return a success CSS class when contribution state is refunded', function() {
        setController(m.prop(ContributionDetailMockery(1, {state: 'refunded'})));
        expect(ctrl.stateClass()).toEqual('.text-refunded');
      });
      it('should return a warning CSS class when contribution state is pending', function() {
        setController(m.prop(ContributionDetailMockery(1, {state: 'pending'})));
        expect(ctrl.stateClass()).toEqual('.text-waiting');
      });
      it('should return an error CSS class when contribution state is refused', function() {
        setController(m.prop(ContributionDetailMockery(1, {state: 'refused'})));
        expect(ctrl.stateClass()).toEqual('.text-error');
      });
      it('should return an error CSS class when contribution state is not known', function() {
        setController(m.prop(ContributionDetailMockery(1, {state: 'foo'})));
        expect(ctrl.stateClass()).toEqual('.text-error');
      });
    });
    describe('paymentMethodClass function', function() {
      var CSSboleto = '.fa-barcode',
          CSScreditcard = '.fa-credit-card',
          CSSerror   = '.fa-question';

      it('should return a boleto CSS class when contribution payment method is boleto', function() {
        setController(m.prop(ContributionDetailMockery(1, {payment_method: 'BoletoBancario'})));
        expect(ctrl.paymentMethodClass()).toEqual(CSSboleto);
      });
      it('should return a credit card CSS class when contribution payment method is credit card', function() {
        setController(m.prop(ContributionDetailMockery(1, {payment_method: 'CartaoDeCredito'})));
        expect(ctrl.paymentMethodClass()).toEqual(CSScreditcard);
      });
      it('should return an error CSS class when contribution payment method is not known', function() {
        setController(m.prop(ContributionDetailMockery(1, {payment_method: 'foo'})));
        expect(ctrl.paymentMethodClass()).toEqual(CSSerror);
      });
    });
  });
});
