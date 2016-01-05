describe('UsersBalance', () => {
    let $output, component,
        UsersBalance = window.c.root.UsersBalance;

    beforeAll(() => {
        component = m.component(UsersBalance, {user_id: 1});
        $output = mq(component);
    });

    it('should render user balance area', () => {
        $output.should.have('.user-balance-section');
    });

    it('should render user balance transactions area', () => {
        $output.should.have('.balance-transactions-area');
    });
});
