describe('TeamTotal', () => {
    let $output,
        TeamTotal = window.c.TeamTotal;

    describe('view', () => {
        beforeAll(() => {
            $output = mq(TeamTotal);
        });

        it('should render fetched team total info', () => {
            expect($output.find('#team-total-static').length).toEqual(1);
        });
    });
});