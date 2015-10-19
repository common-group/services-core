describe('AdminTransactionHistory', () => {
    let c = window.c,
        contribution, historyBox,
        ctrl, view, $output;

    beforeAll(() => {
        contribution = m.prop(ContributionDetailMockery(1));
        historyBox = m.component(c.AdminTransactionHistory, {
            contribution: contribution()[0]
        });
        ctrl = historyBox.controller();
        view = historyBox.view(ctrl, {
            contribution: contribution
        });
        $output = mq(view);
    });

    describe('controller', () => {
        it('should have orderedEvents', () => {
            expect(ctrl.orderedEvents.length).toEqual(2);
        });

        it('should have formated the date on orderedEvents', () => {
            expect(ctrl.orderedEvents[0].date).toEqual('15/01/2015, 17:25');
        });
    });

    describe('view', () => {
        it('should render fetched orderedEvents', () => {
            expect($output.find('.date-event').length).toEqual(2);
        });
    });
});