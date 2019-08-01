import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import menuSearch from '../c/menu-search';
import menuProfile from '../c/menu-profile';

const menu = {
    oninit: function(vnode) {
        const user = h.getUser(),
            menuCss = () => {
                let dynamicClasses;

                return `${vnode.attrs.menuTransparency ? 'overlayer' : ''} ${(vnode.attrs.withAlert || vnode.attrs.withFixedAlert) ? 'with-global-alert' : ''}`;
            },
            homeAttrs = () => {
                if (vnode.attrs.absoluteHome) {
                    return {
                        href: h.rootUrl(),
                        oncreate: m.route.link
                    };
                }
                return {
                    oncreate: m.route.link
                };
            };

        vnode.state = {
            user,
            menuCss,
            homeAttrs
        };
    },
    view: function({state, attrs}) {
        return m('header.main-header', {
            class: state.menuCss()
        }, [
            m('.w-row', [
                m('.w-clearfix.w-col.w-col-8.w-col-small-8.w-col-tiny-8',
                    [
                        m('a.header-logo.w-inline-block[href=\'/?ref=ctrse_header\'][title=\'Catarse\']',
                            state.homeAttrs(),
                            m('img[alt=\'Logo big\'][src=\'/assets/catarse_bootstrap/logo_big.png\']')
                        ),
                        attrs.menuShort ? '' : m('div#menu-components', [
                            m('a.w-hidden-small.w-hidden-tiny.header-link.w-nav-link[href=\'https://crowdfunding.catarse.me/comece\']', 'Comece seu projeto'),
                            m('a.w-hidden-small.w-hidden-tiny.header-link.w-nav-link[href=\'/explore?ref=ctrse_header\']', { oncreate: m.route.link }, 'Explore'),
                            m(menuSearch)
                        ])
                    ]
                ),
                m('.text-align-right.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [
                    state.user ? m(menuProfile, { user: state.user }) : m(`a.w-nav-link.header-link.w-nav-link.btn-edit.u-right[href=\'/${window.I18n.locale}/login?ref=ctrse_header\']`, 'Login'),
                ])

            ]),
            attrs.menuShort ? '' : m('.header-controls-mobile.w-hidden-main.w-hidden-medium',
                [
                    m(`a.header-link.w-nav-link[href=\'/${window.I18n.locale}/start?ref=ctrse_header\']`,
                        { onclick: () => m.route.set('/start') },
                        'Comece seu projeto'
                    ),
                    m(`a.header-link.w-nav-link[href=\'/${window.I18n.locale}/explore?ref=ctrse_header\']`,
                        { onclick: () => m.route.set('/explore') },
                        'Explore'
                    )
                ]
            )
        ]);
    }
};

export default menu;
