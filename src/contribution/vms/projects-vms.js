window.c.contribution.projectFilters = ((m, h, moment) => {
    return () =>{
        const filters = m.postgrest.filtersVM,

              nearMe = filters({
                  near_me: 'eq',
                  open_for_contributions: 'eq',
                  online_date: 'gt'
              }).open_for_contributions('true').near_me(true).online_date(moment().subtract(30, 'days').format('YYYY-MM-DD')),

              expiring = filters({
                  expires_at: 'lte',
                  open_for_contributions: 'eq'
              }).open_for_contributions('true').expires_at(moment().add(14, 'days').format('YYYY-MM-DD')),

              recent = filters({
                  online_date: 'gte',
                  open_for_contributions: 'eq'
              }).open_for_contributions('true').online_date(moment().subtract(5, 'days').format('YYYY-MM-DD')),

              recommended = filters({
                  recommended: 'eq',
                  open_for_contributions: 'eq'
              }).recommended('true').open_for_contributions('true'),

              online = filters({
                  open_for_contributions: 'eq'
              }).open_for_contributions('true'),

              successful = filters({
                  state: 'eq',
                  expires_at: 'gt'
              }).state('successful').expires_at(moment().subtract(30, 'days').format('YYYY-MM-DD'));

        return {
            recommended: {
                title: 'Recomendados',
                filter: recommended
            },
            online: {
                title: 'No ar',
                filter: online
            },
            expiring: {
                title: 'Reta final',
                filter: expiring
            },
            successful: {
                title: 'Bem-sucedidos',
                filter: successful
            },
            recent: {
                title: 'Recentes',
                filter: recent
            },
            near_me: {
                title: 'Próximos a mim',
                filter: nearMe
            }
        };
    };
}(window.m, window.c.h, window.moment));
