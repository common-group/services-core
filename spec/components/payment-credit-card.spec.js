import m from 'mithril';
import paymentCreditCard from '../../src/c/payment-credit-card';
import paymentVM from '../../src/vms/payment-vm';

describe('paymentCreditCard', () => {
    let $output, $output2, vm;
    describe('view', () => {
        beforeAll(() => {
            window.PagarMe = {};
            vm = paymentVM();
            vm.fields.ownerDocument('568.905.638-32');
            spyOn(vm, 'sendPayment').and.returnValue(m.deferred().promise);
            let test = {
                vm: vm,
                contribution_id: 1,
                project_id: 1,
                user_id: 1
            };
            $output = mq(
                m(paymentCreditCard, test)
            );
            $output2 = mq(
                m(paymentCreditCard, test)
            );
        });

        it('should build a credit card payment form', () => {
            expect($output.has('form[name="email-form"]')).toBeTrue();
        });

        it('should display saved credit cards', () => {
            expect($output.find('.back-payment-credit-card-radio-field').length >= 1).toBeTrue();
        });

        describe('when values are not valid', () => {
            beforeAll(() => {
                $output.click('#credit-card-record-1');
                $output.setValue('select[name="expiration-date_month"]', '1');
                $output.setValue('select[name="expiration-date_year"]', '2016');
                $output.setValue('input[name="credit-card-number"]', '1234567812345678');
                $output.setValue('input[name="credit-card-name"]', '123');
                $output.setValue('input[name="credit-card-cvv"]', 'abc');
                $output.trigger('form', 'submit');
            });

            it('should return an error if expiry date is not valid', () => {
                expect($output.find('select.error').length > 0).toBeTrue();
            });
            it('should return an error if credit card number is not valid', () => {
                expect($output.find('input[name="credit-card-number"].error').length > 0).toBeTrue();
            });
            it('should return an error if credit card name is not valid', () => {
                expect($output.find('input[name="credit-card-name"].error').length > 0).toBeTrue();
            });
            it('should return an error if cvv is not valid', () => {
                expect($output.find('input[name="credit-card-cvv"].error').length > 0).toBeTrue();
            })
        });
        describe('when values are valid', () => {
            beforeAll(() => {
                $output.setValue('select[name="expiration-date_month"]', '10');
                $output.setValue('select[name="expiration-date_year"]', '2026');
                vm.creditCardFields.number('4012 8888 8888 1881');
                $output.setValue('input[name="credit-card-name"]', 'Tester');
                $output.setValue('input[name="credit-card-cvv"]', '123');
            });

            it('should send a payment request', () => {
                $output.trigger('form', 'submit');
                expect(vm.sendPayment).toHaveBeenCalled();
            });
        })



    });
});
