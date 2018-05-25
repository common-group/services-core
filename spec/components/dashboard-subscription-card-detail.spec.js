import m from 'mithril';
import dashboardSubscriptionCardDetail from '../../src/c/dashboard-subscription-card-detail';


describe('UserAddressOnDashboardOfUserDetails', () => {
    let $userDetail, $subscription, $output;

    beforeAll(() => {
        $userDetail = UserDetailMockery()[0];
        $subscription = SubscriptionMockery()[0];
        $subscription = _.extend($subscription, {project_external_id: 1});
	    $output = mq(m.component(dashboardSubscriptionCardDetail, {user:$userDetail, subscription:$subscription}));
    });

    it('Should show user address street', () => {
        expect($output.contains($userDetail.address.address_street)).toBeTrue();
    });

	it('Should show user country', () => {
		expect($output.contains($userDetail.address.country_name)).toBeTrue();
	});
});
