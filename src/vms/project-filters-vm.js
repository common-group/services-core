import m from 'mithril';
import moment from 'moment';
import postgrest from 'mithril-postgrest';

const projectFiltersVM = () => {
    const filtersVM = postgrest.filtersVM,
        all = filtersVM({
            state: 'eq'
        }).state('online'),

        nearMe = filtersVM({
            near_me: 'eq',
            open_for_contributions: 'eq'
        }).open_for_contributions('true').near_me(true),

        expiring = filtersVM({
            expires_at: 'lte',
            open_for_contributions: 'eq'
        }).open_for_contributions('true').expires_at(moment().add(14, 'days').format('YYYY-MM-DD')),

        recent = filtersVM({
            online_date: 'gte',
            open_for_contributions: 'eq'
        }).open_for_contributions('true').online_date(moment().subtract(5, 'days').format('YYYY-MM-DD')),

        score = filtersVM({
            score: 'gte',
            open_for_contributions: 'eq'
        }).score('1').open_for_contributions('true'),

        online = filtersVM({
            open_for_contributions: 'eq'
        }).open_for_contributions('true'),

        successful = filtersVM({
            state: 'eq'
        }).state('successful'),

        finished = filtersVM({}),

        filters = {
            all: {
              title: 'Todas as Categorias',
              filter: all,
              nicename: 'No ar',
              isContextual: false,
              keyName: 'all'
          },
            score: {
              title: 'Todas as Categorias',
              filter: score,
              nicename: 'Populares',
              isContextual: false,
              keyName: 'score'
          },
            online: {
              title: 'No ar',
              filter: online,
              isContextual: false,
              keyName: 'online'
          },
            expiring: {
              title: 'Reta final',
              filter: expiring,
              isContextual: false,
              keyName: 'expiring'
          },
            successful: {
              title: 'Todas as Categorias',
              filter: successful,
              nicename: 'Financiados',
              isContextual: false,
              keyName: 'successful'
          },
            finished: {
              title: 'Todas as Categorias',
              filter: finished,
              nicename: 'Finalizados',
              isContextual: false,
              keyName: 'finished'
          },
            recent: {
              title: 'Recentes',
              filter: recent,
              isContextual: false,
              keyName: 'recent'
          },
            near_me: {
              title: 'Próximos a mim',
              filter: nearMe,
              isContextual: false,
              keyName: 'near_me'
          }
        };

    const setContextFilters = (contextFilters) => {
        _.map(contextFilters, (filterKey) => filters[filterKey].isContextual = true);

        return filters;
    },
            getContextFilters = () => {
                return _.filter(filters, (filter) => filter.isContextual);
            },
            removeContextFilter = (filter) => {
                filters[filter.keyName].isContextual = false;

                return filters;
            };

    return {
            filters: filters,
            setContextFilters: setContextFilters,
            getContextFilters: getContextFilters,
            removeContextFilter: removeContextFilter
        };
};

export default projectFiltersVM;
