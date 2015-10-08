window.c.project.Show = ((m, c, _, models, h) => {
  return {
    controller: (args) => {
      const vm = m.postgrest.filtersVM({project_id: 'eq'}),
            idVM = h.idVM,
            projectDetails = m.prop([]),
            userDetails = m.prop([]),
            rewardDetails = m.prop([]);

      vm.project_id(args.project_id);
      idVM.id(args.project_user_id);

      models.projectDetail.getRowWithToken(vm.parameters()).then((data) => {
        models.userDetail.getRowWithToken(idVM.parameters()).then(userDetails);
        models.rewardDetail.getPageWithToken(vm.parameters()).then(rewardDetails);

        projectDetails(data);
      });

      return {
        projectDetails: projectDetails,
        userDetails: userDetails,
        rewardDetails: rewardDetails
      };
    },

    view: (ctrl) => {
      return _.map(ctrl.projectDetails(), (project) => {
        return m('.project-show',{config: h.mixpanelTrack()},[
          m.component(c.ProjectHeader, {project: project, userDetails: ctrl.userDetails}),
          m.component(c.ProjectTabs, {project: project}),
          m.component(c.ProjectMain, {project: project, rewardDetails: ctrl.rewardDetails}),
          (project.is_owner_or_admin ? m.component(c.ProjectDashboardMenu, {project: project}) : '')
        ]);
      });
    }
  };
}(window.m, window.c, window._, window.c.models, window.c.h));
