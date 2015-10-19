describe('TeamMembers', () => {
    var $output,
        TeamMembers = window.c.TeamMembers;

    describe('view', () => {
        beforeAll(() => {
            $output = mq(TeamMembers);
        });

        it('should render fetched team members', () => {
            expect($output.has('#team-members-static')).toEqual(true);
            expect($output.find('.team-member').length).toEqual(TeamMembersMockery(10).length);
        });
    });
});