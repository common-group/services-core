import m from 'mithril';
import moment from 'moment';
import {catarse} from '../api';

const projectFiltersVM = () => {
    const filtersVM = catarse.filtersVM,
        all = filtersVM({
            state: 'eq'
        }).state('online'),

        nearMe = filtersVM({
            near_me: 'eq',
            open_for_contributions: 'eq'
        }).open_for_contributions('true').near_me(true),

        sub = filtersVM({
            mode: 'eq'
        }).mode('sub'),

        notSub = filtersVM({
            mode: 'not.eq'
        }).mode('sub'),

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

        recommended = filtersVM({
            open_for_contributions: 'eq'
        }).open_for_contributions('true'),

        contributed_by_friends = filtersVM({
            open_for_contributions: 'eq',
            contributed_by_friends: 'eq'
        }).open_for_contributions('true').contributed_by_friends(true),

        successful = filtersVM({
            state: 'eq'
        }).state('successful'),

        finished = filtersVM({}),

        filters = {
            all: {
                title: 'Todas as Categorias',
                filter: all,
                nicename: 'Populares',
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
            contributed_by_friends: {
                title: 'Amigos',
                filter: contributed_by_friends,
                nicename: 'Apoiados por amigos',
                isContextual: false,
                keyName: 'contributed_by_friends'
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
                nicename: 'Reta final',
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
            recommended_1: {
                title: 'Recomendados',
                filter: recommended,
                nicename: 'Recomendados',
                isContextual: false,
                keyName: 'recommended_1'
            },
            recommended_2: {
                title: 'Recomendados',
                filter: recommended,
                nicename: 'Recomendados',
                isContextual: false,
                keyName: 'recommended_2'
            },
            not_sub: {
                title: 'Projetos pontuais',
                filter: notSub,
                isContextual: false,
                keyName: 'not_sub'
            },
            all_modes: {
                title: 'Todos os projetos',
                filter: null,
                isContextual: false,
                keyName: 'all_modes'
            },
            sub: {
                title: 'Projetos recorrentes',
                filter: sub,
                isContextual: false,
                keyName: 'sub'
            },
            recent: {
                title: 'Recentes',
                filter: recent,
                nicename: 'Recentes',
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
            _.map(contextFilters, filterKey => filters[filterKey].isContextual = true);

            return filters;
        },
        getContextFilters = () => _.filter(filters, filter => filter.isContextual),
        removeContextFilter = (filter) => {
            filters[filter.keyName].isContextual = false;

            return filters;
        };

    return {
        filters,
        setContextFilters,
        getContextFilters,
        removeContextFilter
    };
};

export default projectFiltersVM;
