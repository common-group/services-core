adminApp.AdminContributionsList = {
  view: function(ctrl, args) {
    return m("#admin-contributions-list.w-container",[
      args.contributions().map(function(contribution){
        return m.component(adminApp.AdminContributionsListDetail, {contribution: contribution, key: contribution});
      })
    ]);
  }
}
