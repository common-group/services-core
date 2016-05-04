import m from 'mithril';
import _ from 'underscore';
import filterMain from './filter-main';

const adminFilter = {
    controller () {
        return {
            toggler: h.toggleProp(false, true)
        };
    },
    view (ctrl, args) {
        const filterBuilder = args.filterBuilder,
            data = args.data,
            label = args.label || '',
            main = _.findWhere(filterBuilder, {
                component: filterMain
            });

        return m('#admin-contributions-filter.w-section.page-header', [
            m('.w-container', [
                m('.fontsize-larger.u-text-center.u-marginbottom-30', label),
                m('.w-form', [
                    m('form', {
                        onsubmit: args.submit
                    }, [
                        main ? m.component(main.component, main.data) : '',
                        m('.u-marginbottom-20.w-row',
                            m('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[style="background: none; border: none; outline: none; text-align: left;"][type="button"]', {
                                onclick: ctrl.toggler.toggle
                            }, 'Filtros avançados  >')), (ctrl.toggler() ?
                            m('#advanced-search.w-row.admin-filters', [
                                _.map(filterBuilder, function(f) {
                                    return (f.component !== filterMain) ? m.component(f.component, f.data) : '';
                                })
                            ]) : ''
                        )
                    ])
                ])
            ])
        ]);
    }
};

export default adminFilter;
