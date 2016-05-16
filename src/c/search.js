/**
 * window.c.Search component
 * Returns a search input
 *
 * Example:
 * m.component(c.Search, {action: '/search', method: 'GET'})
 */

import m from 'mithril';

const search = {
    view(ctrl, args = {}) {
        const action = args.action || '/pt/explore',
            method = args.method || 'GET';

        return m('#search.w-container.w-hidden-main.w-hidden-medium', [
            m('.w-row', [
                m('.w-col.w-col-10.u-marginbottom-20', [
                    m('.w-form', [
                        m('form#email-form', {action: action, method: method}, [
                            m('.w-row', [
                                m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [
                                    m('input[type="text"][name="pg_search"][placeholder="Busque projetos"]#pg_search_inside.w-input.text-field.negative.prefix')
                                ]),
                                m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [
                                    m('button.w-inline-block.btn.btn-dark.btn-attached.postfix', [
                                        m('img.header-lupa[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/54e44178b2135fce2b6cd235_lupa.png"]')
                                    ])
                                ])
                            ])
                        ])
                    ])
                ])
            ])
        ]);
    }
};

export default search;
