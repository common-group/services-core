import teamMembers from '../../src/c/team-members';

describe('TeamMembers', () => {
    let $output;

    describe('view', () => {
        beforeAll(() => {
            $output = mq(teamMembers);
        });

        it('should render fetched team members', () => {
            expect($output.has('#team-members-static')).toEqual(true);
            expect($output.find('.team-member').length).toEqual(TeamMembersMockery(10).length);
        });
    });
});
