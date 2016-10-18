import m from 'mithril';
import teamTotal from '../c/team-total';
import teamMembers from '../c/team-members';

const team = {
    view() {
        return m('#static-team-app', [
            m.component(teamTotal),
            m.component(teamMembers)
        ]);
    }
};

export default team;
