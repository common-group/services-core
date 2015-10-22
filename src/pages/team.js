window.c.pages.Team = (function(m, c) {
    return {
        view: function() {
            return m('#static-team-app', [
                m.component(c.TeamTotal),
                m.component(c.TeamMembers)
            ]);
        }
    };
}(window.m, window.c));
