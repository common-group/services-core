window.c.AdminFilter = (function(c, m, _, h) {
    return {
        controller: function() {
            return {
                toggler: h.toggleProp(false, true)
            };
        },
        view: (ctrl, args) => {
            var filterBuilder = args.filterBuilder,
                data = args.data,
                label = args.label || '',
                main = _.findWhere(filterBuilder, {
                    component: 'FilterMain'
                });

            return m('#admin-contributions-filter.w-section.page-header', [
                m('.w-container', [
                    m('.fontsize-larger.u-text-center.u-marginbottom-30', label),
                    m('.w-form', [
                        m('form', {
                            onsubmit: args.submit
                        }, [
                            (_.findWhere(filterBuilder, {
                                component: 'FilterMain'
                            })) ? m.component(c[main.component], main.data) : '',
                            m('.u-marginbottom-20.w-row',
                                m('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[style="background: none; border: none; outline: none; text-align: left;"][type="button"]', {
                                    onclick: ctrl.toggler.toggle
                                }, 'Filtros avançados  >')), (ctrl.toggler() ?
                                m('#advanced-search.w-row.admin-filters', [
                                    _.map(filterBuilder, function(f) {
                                        return (f.component !== 'FilterMain') ? m.component(c[f.component], f.data) : '';
                                    })
                                ]) : ''
                            )
                        ])
                    ])
                ])
            ]);
        }
    };
}(window.c, window.m, window._, window.c.h));
