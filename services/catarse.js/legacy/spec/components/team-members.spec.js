import mq from 'mithril-query';
import m from 'mithril';
import teamMembers from '../../src/c/team-members';

describe('TeamMembers', () => {
    let $output;

    describe('view', () => {
        beforeAll(() => {
            $output = mq(m(teamMembers));
        });

        it('should render fetched team members', () => {
            setTimeout(() => {
                expect($output.has('#team-members-static.w-section.section')).toEqual(true);
                expect($output.find('.team-member').length).toEqual(TeamMembersMockery(10).length);
            }, 200)
        });
    });
});
