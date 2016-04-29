window.c.root.ProjectsContributionReportVM = ((m, h, replaceDiacritics) => {
    const vm = m.postgrest.filtersVM({
        full_text_index: '@@',
        state: 'eq',
        reward_id: 'eq',
        project_id: 'eq'
    }),
          paramToString = (p) => {
              return (p||'').toString().trim();
          };

    vm.state('');
    vm.order({
        id: 'desc'
    });

    vm.full_text_index.toFilter = () => {
        const filter = paramToString(vm.full_text_index());
        return filter && replaceDiacritics(filter) || undefined;
    };

    return vm;
}(window.m, window.c.h, window.replaceDiacritics));
