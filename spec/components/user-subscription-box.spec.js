import m from 'mithril';
import h from '../../src/h';
import userSubscriptionBox from '../../src/c/user-subscription-box.js';

describe('UserSubscriptionBox', () => {
    let $subscriptionVersionWithNewDataShow, subscriptionData, paymentInfoData;

    describe('view', () => {
        beforeAll(() => {
            subscriptionData = SubscriptionVersionMockery();
            paymentInfoData = PaymentInfoMockery();
            $subscriptionVersionWithNewDataShow = mq(m.component(userSubscriptionBox, {
                subscription: _.extend({}, subscriptionData, {
                    boleto_url: paymentInfoData.boleto_url,
                    boleto_expiration_date: paymentInfoData.boleto_expiration_date,
                    payment_status: paymentInfoData.status
                })
            }));
        });

        it('Should render new payment method of the current paid subscription', () => {
            expect($subscriptionVersionWithNewDataShow.has('.fa.fa-credit-card')).toBeTrue(); 
        });

        it('Should render new value of the current paid subscription', () => {
            expect($subscriptionVersionWithNewDataShow.contains('R$ 10')).toBeTrue(); 
        });

        it('Should render new reward of the current paid subscription', () => {
            expect($subscriptionVersionWithNewDataShow.contains('Notas')).toBeTrue(); 
        });

        it('Should render info about next charge', () => {
            expect($subscriptionVersionWithNewDataShow.contains('As alterações destacadas entrarão em vigor na próxima cobrança')).toBeTrue();
        });

        it('Should render generate second slip button', () => {
            expect($subscriptionVersionWithNewDataShow.contains('Gerar segunda via')).toBeTrue();
        });
    });
});
