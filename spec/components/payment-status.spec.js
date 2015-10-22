describe('PaymentStatus', function() {
    var c = window.c,
        ctrl,
        setController = function(contribution) {
            var payment = {
                gateway: contribution.gateway,
                gateway_data: contribution.gateway_data,
                installments: contribution.installments,
                state: contribution.state,
                payment_method: contribution.payment_method
            };
            ctrl = m.component(c.PaymentStatus, {
                item: payment
            }).controller();
        };

    describe('stateClass function', function() {
        it('should return a success CSS class when contribution state is paid', function() {
            var contribution = ContributionDetailMockery(1, {
                state: 'paid'
            })[0];
            setController(contribution);
            expect(ctrl.stateClass()).toEqual('.text-success');
        });
        it('should return a success CSS class when contribution state is refunded', function() {
            var contribution = ContributionDetailMockery(1, {
                state: 'refunded'
            })[0];
            setController(contribution);
            expect(ctrl.stateClass()).toEqual('.text-refunded');
        });
        it('should return a warning CSS class when contribution state is pending', function() {
            var contribution = ContributionDetailMockery(1, {
                state: 'pending'
            })[0];
            setController(contribution);
            expect(ctrl.stateClass()).toEqual('.text-waiting');
        });
        it('should return an error CSS class when contribution state is refused', function() {
            var contribution = ContributionDetailMockery(1, {
                state: 'refused'
            })[0];
            setController(contribution);
            expect(ctrl.stateClass()).toEqual('.text-error');
        });
        it('should return an error CSS class when contribution state is not known', function() {
            var contribution = ContributionDetailMockery(1, {
                state: 'foo'
            })[0];
            setController(contribution);
            expect(ctrl.stateClass()).toEqual('.text-error');
        });
    });

    describe('paymentMethodClass function', function() {
        var CSSboleto = '.fa-barcode',
            CSScreditcard = '.fa-credit-card',
            CSSerror = '.fa-question';

        it('should return a boleto CSS class when contribution payment method is boleto', function() {
            var contribution = ContributionDetailMockery(1, {
                payment_method: 'BoletoBancario'
            })[0];
            setController(contribution);
            expect(ctrl.paymentMethodClass()).toEqual(CSSboleto);
        });
        it('should return a credit card CSS class when contribution payment method is credit card', function() {
            var contribution = ContributionDetailMockery(1, {
                payment_method: 'CartaoDeCredito'
            })[0];
            setController(contribution);
            expect(ctrl.paymentMethodClass()).toEqual(CSScreditcard);
        });
        it('should return an error CSS class when contribution payment method is not known', function() {
            var contribution = ContributionDetailMockery(1, {
                payment_method: 'foo'
            })[0];
            setController(contribution);
            expect(ctrl.paymentMethodClass()).toEqual(CSSerror);
        });
    });

    describe('view', function() {
        var getOutput = function(payment_method) {
            var contribution = ContributionDetailMockery(1, {
                    payment_method: payment_method
                })[0],
                payment = {
                    gateway: contribution.gateway,
                    gateway_data: contribution.gateway_data,
                    installments: contribution.installments,
                    state: contribution.state,
                    payment_method: contribution.payment_method
                };
            return mq(m.component(c.PaymentStatus, {
                item: payment
            }));
        };

        it('should return an HTML element describing a boleto when payment_method is boleto', function() {
            expect(getOutput('BoletoBancario').has('#boleto-detail')).toBeTrue();
        });
        it('should return an HTML element describing a credit card when payment_method is credit card', function() {
            expect(getOutput('CartaoDeCredito').has('#creditcard-detail')).toBeTrue();
        });
    });
});