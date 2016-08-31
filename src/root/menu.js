import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import menuSearch from '../c/menu-search';
import menuProfile from '../c/menu-profile';

const menu = {
    controller(args) {
        const user = h.getUser(),
            menuCss = () => {
                let dynamicClasses;

                return `${args.menuTransparency ? 'overlayer' : ''} ${args.withAlert ? 'with-global-alert' : ''}`
            };

        return {
            user: user,
            menuCss: menuCss
        };
    },
    view(ctrl, args) {
        return m('header.main-header.w-section',{
            class: ctrl.menuCss()
        },
            [
                m('.w-clearfix',
                    [
                        m('a.header-logo.w-nav-brand[href=\'/\'][title=\'Catarse\']',
                            {config: m.route},
                            m('img[alt=\'Logo big\'][src=\'/assets/catarse_bootstrap/logo_big-8726f3436ac23c97959d3f7bf10365b7.png\']')
                        ),
                        m('a.w-hidden-small.w-hidden-tiny.header-link.w-nav-link[href=\'/start\']',{config: m.route}, 'Comece seu projeto'),
                        m('a.w-hidden-small.w-hidden-tiny.header-link.w-nav-link[href=\'/explore\']',{config: m.route},'Explore'),
                        m.component(menuSearch),
                        ctrl.user ? m.component(menuProfile, {user: ctrl.user}) : m('a.w-nav-link.header-link.w-nav-link.btn-edit.u-right[href=\'/pt/login\']', 'Login'),
                        m('a.w-nav-link.w-hidden-small.w-hidden-tiny.header-link.w-nav-link.u-right[href=\'http://blog.catarse.me\'][target=\'_blank\']',
                            {style: 'float: right;'},
                            'Blog'
                        )
                    ]
                ),
                m('.w-hidden-main.w-hidden-medium.header-controls-mobile',
                    [
                        m('a.header-link.w-nav-link[href=\'/pt/start\']',
                            {onclick: () => m.route('/start')},
                            'Comece seu projeto'
                        ),
                        m('a.header-link.w-nav-link[href=\'/pt/explore\']',
                            {onclick: () => m.route('/explore')},
                            'Explore'
                        )
                    ]
                )
            ]
        );
    }
};

export default menu;
