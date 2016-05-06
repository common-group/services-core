import m from 'mithril';
import usersBalance from '../../src/root/users-balance';
import userBalanceTransactions from '../../src/c/user-balance-transactions';

describe('UserBalanceTransactions', () => {
    let $output, component, parentComponent;

    beforeAll(() => {
        parentComponent = m.component(usersBalance, {user_id: 1});
        component = m.component(userBalanceTransactions, _.extend({}, parentComponent.controller(), {user_id: 1}));
        $output = mq(component);
    });

    it('should call balance transactions endpoint', () => {
        const lastRequest = jasmine.Ajax.requests.mostRecent();
        expect(lastRequest.url).toEqual(apiPrefix + '/balance_transactions?order=created_at.desc&user_id=eq.1');
        expect(lastRequest.method).toEqual('GET');
    });

    it('should render user balance transactions', () => {
        $output.should.have('.card-detailed-open');
        expect($output.contains('R$ 604,50')).toEqual(true);
        expect($output.contains('R$ 0,00')).toEqual(true);
        expect($output.contains('R$ -604,50')).toEqual(true);
        expect($output.contains('Project x')).toEqual(true);
    });
});
