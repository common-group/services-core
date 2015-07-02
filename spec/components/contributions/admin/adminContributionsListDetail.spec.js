describe('AdminContributionsListDetails component', function() {
  var setController = function(contribution){
    ctrl = m.component(adminApp.AdminContributionsListDetail, {contribution: contribution()[0]}).controller();
  };

  describe('controller', function(){
    beforeAll(function() {
      contribution = m.prop(ContributionDetailMockery(1));
      setController(contribution);
    });

    it('should have a payment_details function', function() {
      expect(ctrl.paymentDetails).toBeFunction();
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
        expect(ctrl.stateClass()).toEqual(ctrl.CSSsuccess);
      });
      it('should return a success CSS class when contribution state is refunded', function() {
        setController(m.prop(ContributionDetailMockery(1, {state: 'refunded'})));
        expect(ctrl.stateClass()).toEqual(ctrl.CSSsuccess);
      });
      it('should return a warning CSS class when contribution state is pending', function() {
        setController(m.prop(ContributionDetailMockery(1, {state: 'pending'})));
        expect(ctrl.stateClass()).toEqual(ctrl.CSSwaiting);
      });
      it('should return an error CSS class when contribution state is refused', function() {
        setController(m.prop(ContributionDetailMockery(1, {state: 'refused'})));
        expect(ctrl.stateClass()).toEqual(ctrl.CSSerror);
      });
      it('should return an error CSS class when contribution state is not known', function() {
        setController(m.prop(ContributionDetailMockery(1, {state: 'foo'})));
        expect(ctrl.stateClass()).toEqual(ctrl.CSSerror);
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
    describe('paymentDetails function', function() {
      var expected = {
            card_first_digits: '12345',
            card_last_digits: '890',
            card_brand: 'Visa',
            installments: '1'
          },
          moip = {
            gateway: 'MoIP',
            gateway_data: {
              cartao_bin: expected.card_first_digits,
              cartao_final: expected.card_last_digits,
              cartao_bandeira: expected.card_brand,
              parcelas: expected.installments
            }
          },
          pagarme = {
            gateway: 'Pagarme',
            gateway_data: {
              card_first_digits: expected.card_first_digits,
              card_last_digits: expected.card_last_digits,
              card_brand: expected.card_brand,
              installments: expected.installments
            }
          };

      it('should set payment details when contribution gateway is Pagarme', function() {
        setController(m.prop(ContributionDetailMockery(1, pagarme)));
        ctrl.paymentDetails();
        expect(ctrl.contribution).toEqual(jasmine.objectContaining(expected));
      });
      it('should set payment details when contribution gateway is MoIP', function() {
        setController(m.prop(ContributionDetailMockery(1, moip)));
        ctrl.paymentDetails();
        expect(ctrl.contribution).toEqual(jasmine.objectContaining(expected));
      });
      it('should return false when contribution gateway is not known', function() {
        setController(m.prop(ContributionDetailMockery(1, {gateway: 'foo'})));
        expect(ctrl.paymentDetails()).toBeFalse();
      });
    });
  });
});
