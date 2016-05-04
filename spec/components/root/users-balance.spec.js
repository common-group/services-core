import usersBalance from '../../../src/root/users-balance'

describe('UsersBalance', () => {
    let $output, component;

    beforeAll(() => {
        component = m.component(usersBalance, {user_id: 1});
        $output = mq(component);
    });

    it('should render user balance area', () => {
        $output.should.have('.user-balance-section');
    });

    it('should render user balance transactions area', () => {
        $output.should.have('.balance-transactions-area');
    });
});
