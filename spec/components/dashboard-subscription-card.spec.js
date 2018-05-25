import m from 'mithril';
import subscriptionStatusIcon from '../../src/c/subscription-status-icon';
import moment from 'moment';

describe('ShowDateFromSubscriptionTransition', () => {
    let $subscription, $output;

    beforeAll(() => {
        $subscription = SubscriptionMockery()[1];
	      $output = mq(m.component(subscriptionStatusIcon, {subscription:$subscription}));
    });

    it('Should show subscription transition date', () => {
        let dateString = moment($subscription.transition_date).format('DD/MM/YYYY');
        expect($output.contains(dateString)).toBeTrue();
    });
});
