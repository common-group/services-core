/**
 * window.c.Search component
 * Returns a search input
 *
 * Example:
 * m.component(c.Search, {action: '/search', method: 'GET'})
 */

import m from 'mithril';

const search = {
    view: function(ctrl, args = {}) {
        const action = args.action || '/pt/explore?ref=ctrse_explore_pgsearch',
            method = args.method || 'GET';

        return m("#search.w-hidden-main.w-hidden-medium.w-row", [
            m(".w-col.w-col-11",
                m(".header-search",
                    m(".w-row", [
                        m(".w-col.w-col-10.w-col-small-10.w-col-tiny-10",
                            m(".w-form", [
                                m("form", {
                                        action,
                                        method
                                    },
                                    m('input[type="text"][name="pg_search"][placeholder="Busque projetos"]#pg_search_inside.w-input.text-field.negative.prefix')
                                )
                            ])
                        ),
                        m(".w-col.w-col-2.w-col-small-2.w-col-tiny-2",
                            m("a.btn.btn-attached.postfix.btn-dark.w-inline-block[href='#']",
                                m('img.header-lupa[alt=\'Lupa\'][data-pin-nopin=\'true\'][src=\'/assets/catarse_bootstrap/lupa.png\']')
                            )
                        )
                    ])
                )
            ),
            m(".w-col.w-col-1")
        ]);
    }
};

export default search;