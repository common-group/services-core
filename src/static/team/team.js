staticApp.Team = {
  view: function(ctrl, args) {
    return m("#static-team-app",[
      m.component(staticApp.TeamTotal),
      m.component(staticApp.TeamMembers)
    ])
  }
};
