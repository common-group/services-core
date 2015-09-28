window.c.project.Show = (function(m, c, _, models, h){
  return {
    controller: function(args) {
      var vm = m.postgrest.filtersVM({project_id: 'eq'}),
          idVM = h.idVM,
          projectDetails = m.prop([]),
          userDetails = m.prop([]),
          rewardDetails = m.prop([]);

      vm.project_id(args.project_id);

      models.projectDetail.getRowWithToken(vm.parameters()).then(function(data) {
        var project = data[0];
        projectDetails(data);

        idVM.id(project.user_id);
        models.userDetail.getRowWithToken(idVM.parameters()).then(userDetails);
      });

      models.rewardDetail.getPage(vm.parameters()).then(rewardDetails);

      return {
        vm: vm,
        projectDetails: projectDetails,
        userDetails: userDetails,
        rewardDetails: rewardDetails
      };
    },

    view: function(ctrl) {
      return _.map(ctrl.projectDetails(), function(project){
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
