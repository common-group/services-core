import m from 'mithril';
import paymentCreditCard from '../../src/c/payment-credit-card';
import paymentVM from '../../src/vms/payment-vm';

fdescribe('paymentCreditCard', () => {
    let $output;

    describe('view', () => {
        beforeAll(() => {
            let vm = paymentVM();
            let test = {
                vm: vm,
                contribution_id: 1,
                project_id: 1,
                user_id: 1
            };
            $output = mq(
                m(paymentCreditCard, test)
            );
            $output.click('#credit-card-record-1');
        });

        it('should build a credit card payment form', () => {
            expect($output.has('form[name="email-form"]')).toBeTrue();
        });
        it('should display saved credit cards', () => {
            expect($output.find('.back-payment-credit-card-radio-field').length >= 1).toBeTrue();
        });
        it('should return an inline error if expiry date is not valid', () => {
            $output.setValue('select[name="expiration-date_month"]', '1');
            $output.setValue('select[name="expiration-date_year"]', '2016');
            $output.click('input[type="submit"]');
            console.log('Values sent!')
            expect($output.has('#credit-card-date > .text-error')).toBeTrue();
        });
        it('should return an inline error if credit card number is not valid', () => {
            $output.setValue('input[name="credit-card-number"]', '1234567812345678');
            $output.click('input[type="submit"]');
            expect($output.has('#credit-card-number > .text-error')).toBeTrue();
        });
        it('should return an inline error if credit card name is not valid', () => {
            $output.setValue('input[name="credit-card-name"]', '123');
            $output.click('input[type="submit"]');
            expect($output.has('#credit-card-name > .text-error')).toBeTrue();
        });
        it('should return an inline error if cvv is not valid', () => {
            $output.setValue('input[name="credit-card-number"]', '4012888888881881');
            $output.setValue('input[name="credit-card-cvv"]', '1234');
            $output.click('input[type="submit"]');
            expect($output.has('#credit-card-cvv > .text-error')).toBeTrue();
        })

    });
});
