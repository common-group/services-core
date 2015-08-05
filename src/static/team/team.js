window.catarse.staticApp.Team = (function(m, staticApp){
  return {
    view: function() {
      return m("#static-team-app",[
        m.component(staticApp.TeamTotal),
        m.component(staticApp.TeamMembers)
      ]);
    }
  };
}(window.m, window.catarse.staticApp));
