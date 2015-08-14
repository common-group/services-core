window.c.admin.ProjectInsights = (function(m, c, models){
  return {
    controller: function(args) {
      var vm = m.postgrest.filtersVM({project_id: 'eq'}),
          resource = m.prop({}),
          resourceId = args.root.getAttribute('data-id');

      vm.project_id(resourceId);

      models.projectDetail.getRow(vm.parameters()).then(function(data){
        resource(data[0]);
      });

      return {
        vm: vm,
        resource: resource
      };
    },
    view: function(ctrl) {
      return m('.project-insights',[
        m('.w-row', [
          m('.w-col.w-col-2'),
          m('.w-col.w-col-8.dashboard-header.u-text-center', [
            m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', 'Minha campanha'),
            m.component(c.AdminProjectDetailsCard, {resource: ctrl.resource})
          ]),
          m('.w-col.w-col-2')
        ])
      ]);
    }
  };
}(window.m, window.c, window.c.models));
