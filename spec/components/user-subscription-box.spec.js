import m from 'mithril';
import h from '../../src/h';
import userSubscriptionBox from '../../src/c/user-subscription-box.js';

describe('UserSubscriptionBox', () => {
    let $subscriptionVersionWithNewDataShow, subscriptionData;

    describe('view', () => {
        beforeAll(() => {
            subscriptionData = SubscriptionVersionMockery();
            $subscriptionVersionWithNewDataShow = mq(m.component(userSubscriptionBox, {
                subscription: subscriptionData
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
    });
});
