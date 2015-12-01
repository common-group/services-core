describe('AdminNotificationHistory', () => {
    let c = window.c,
        user, historyBox,
        ctrl, view, $output;

    beforeAll(() => {
        user = m.prop(UserDetailMockery(1));
        $output = mq(c.AdminNotificationHistory, {user: user()[0]});
    });

    describe('view', () => {
        it('should render fetched notifications', () => {
            expect($output.find('.date-event').length).toEqual(1);
        });
    });
});