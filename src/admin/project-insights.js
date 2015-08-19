window.c.admin.ProjectInsights = (function(m, c, models){
  return {
    controller: function(args) {
      var vm = m.postgrest.filtersVM({project_id: 'eq'}),
          projectDetails = m.prop([]),
          contributionsPerDay = m.prop([]);

      vm.project_id(args.root.getAttribute('data-id'));

      models.projectDetail.getRow(vm.parameters()).then(projectDetails);
      models.projectContributionsPerDay.getRow(vm.parameters()).then(contributionsPerDay);

      return {
        vm: vm,
        projectDetails: projectDetails,
        contributionsPerDay: contributionsPerDay
      };
    },
    view: function(ctrl) {
      return ctrl.projectDetails().map(function(project){
        return m('.project-insights',[
          m('.w-row.u-marginbottom-40', [
            m('.w-col.w-col-2'),
            m('.w-col.w-col-8.dashboard-header.u-text-center', [
              m.component(c.AdminProjectDetailsCard, {resource: project}),
              m.component(c.AdminProjectDetailsExplanation, {resource: project})
            ]),
            m('.w-col.w-col-2')
          ]),
          (function(project){
            if (project.is_published) {
              return [
                m('.divider'),
                m('.w-section.section-one-column.bg-gray.before-footer',[
                  m('.w-row', [
                    m('.w-col.w-col-12.dashboard-header.u-text-center', {style: {'min-height': '300px'}}, [
                      m.component(c.ProjectChartContributionTotalPerDay, {collection: ctrl.contributionsPerDay})
                    ]),
                  ]),
                  m('.w-row', [
                    m('.w-col.w-col-12.dashboard-header.u-text-center', {style: {'min-height': '300px'}}, [
                      m.component(c.ProjectChartContributionAmountPerDay, {collection: ctrl.contributionsPerDay})
                    ]),
                  ]),
                  m('.w-row', [
                    m('.w-col.w-col-12.dashboard-header.u-text-center', {style: {'min-height': '300px'}}, [
                      m.component(c.ProjectReminderCount, {resource: project})
                    ]),
                  ])
                ])
              ];
            }
          }(project))
        ]);
      });
    }
  };
}(window.m, window.c, window.c.models));
