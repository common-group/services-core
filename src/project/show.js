window.c.project.Show = ((m, c, _, models, h) => {
  return {
    controller: (args) => {
      const vm = m.postgrest.filtersVM({project_id: 'eq'}),
            idVM = h.idVM,
            projectDetails = m.prop([]),
            userDetails = m.prop([]),
            rewardDetails = m.prop([]);

      vm.project_id(args.project_id);

      models.projectDetail.getRowWithToken(vm.parameters()).then((data) => {
        let project = data[0];
        projectDetails(data);

        idVM.id(project.user_id);
        models.userDetail.getRowWithToken(idVM.parameters()).then(userDetails);
      });

      models.rewardDetail.getPage(vm.parameters()).then(rewardDetails);

      return {
        projectDetails: projectDetails,
        userDetails: userDetails,
        rewardDetails: rewardDetails
      };
    },

    view: (ctrl) => {
      return _.map(ctrl.projectDetails(), (project) => {
        return m('.project-show', [
          m.component(c.ProjectHeader, {project: project, userDetails: ctrl.userDetails}),
          m.component(c.ProjectTabs, {project: project}),
          m.component(c.ProjectMain, {project: project, rewardDetails: ctrl.rewardDetails}),
          (project.is_owner_or_admin ? m.component(c.ProjectNav, {project: project}) : '')
        ]);
      });
    }
  };
}(window.m, window.c, window._, window.c.models, window.c.h));
