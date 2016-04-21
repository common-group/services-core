window.c.root.ProjectsContributionReport = ((m, c, _, h, models) => {
    return {
        controller: (args) => {
            const listVM = m.postgrest.paginationVM(models.projectContribution,
                                                    'id.desc', {'Prefer': 'count=exact'}),
                  filterVM = m.postgrest.filtersVM({
                      project_id: 'eq',
                      state: 'eq',
                      reward_id: 'eq'
                  });

            filterVM.project_id(args.root.getAttribute('data-id'));

            if(!listVM.collection().length) {
                listVM.firstPage(filterVM.parameters());
            }

            return {
                listVM: listVM,
                filterVM: filterVM
            };
        },
        view: (ctrl, args) => {
            const list = ctrl.listVM;

            return [
                m.component(c.ProjectContributionReportHeader),
                m('.divider.u-margintop-30'),
                m.component(c.ProjectContributionReportContent, {
                    list: list
                })
            ];
        }
    };
}(window.m, window.c, window._, window.c.h, window.c.models));
