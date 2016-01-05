describe('UserBalanceRequestModalContent', () => {
    let $output, component, parentComponent,
        UsersBalance = window.c.root.UsersBalance,
        UserBalanceModal = window.c.UserBalanceRequestModalContent;

    beforeAll(() => {
        parentComponent = m.component(UsersBalance, {user_id: 1});
        component = m.component(UserBalanceModal, _.extend(
            {},
            parentComponent.controller(),
            {
                balance: {
                    amount: 205,
                    user_id: 1
                }
            }));
        $output = mq(component);
    });

    it('should call bank account endpoint', () => {
        const lastRequest = jasmine.Ajax.requests.mostRecent();
        expect(lastRequest.url).toEqual(apiPrefix + '/bank_accounts?user_id=eq.1');
        expect(lastRequest.method).toEqual('GET');
    });

    it('should render user bank account / amount data', () => {
        expect($output.contains('R$ 205,00')).toEqual(true);
        expect($output.contains('Banco XX')).toEqual(true);
        $output.should.have('.btn-request-fund');
    });

    it('should call balance transfer endpoint when click on request fund btn and show success message', () => {
        $output.click('.btn-request-fund');
        $output.should.have('.fa-check-circle');

        const lastRequest = jasmine.Ajax.requests.filter(/balance_transfers/)[0];
        expect(lastRequest.url).toEqual(apiPrefix + '/balance_transfers');
        expect(lastRequest.method).toEqual('POST');
    });
});
