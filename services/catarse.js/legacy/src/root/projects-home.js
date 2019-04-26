import m from 'mithril';
import { catarse } from '../api';
import _ from 'underscore';
import h from '../h';
import models from '../models';
import homeVM from '../vms/home-vm';
import slider from '../c/slider';
import projectsDisplay from '../c/projects-display';
import blogBanner from './blog-banner';
import UnsignedFriendFacebookConnect from '../c/unsigned-friend-facebook-connect';

const I18nScope = _.partial(h.i18nScope, 'projects.home');

const projectsHome = {
    oninit: function(vnode) {
        const userFriendVM = catarse.filtersVM({ user_id: 'eq' }),
            friendListVM = catarse.paginationVM(models.userFriend, 'user_id.desc', {
                Prefer: 'count=exact'
            }),
            currentUser = h.getUser() || {},
            hasFBAuth = currentUser.has_fb_auth,
            vm = homeVM();

        userFriendVM.user_id(currentUser.user_id);

        if (hasFBAuth && !friendListVM.collection().length) {
            friendListVM.firstPage(userFriendVM.parameters());
        }

        vnode.state = {
            slidesContent: vm.banners,
            hasFBAuth
        };
    },
    view: function({state}) {
        const slides = () => _.map(state.slidesContent, (slide) => {
            const customStyle = `background-image: url(${slide.image});`;
            const content = m('.w-container.u-text-center', [
                m('.w-row.u-marginbottom-40', [
                    m('h1.fontcolor-negative.fontsize-megajumbo.u-marginbottom-20', m.trust(slide.title)),
                    m('h2.fontcolor-negative.fontsize-large', m.trust(slide.subtitle))
                ]),
                m('a.btn.btn-large.u-marginbottom-10.btn-inline', { href: slide.link }, slide.cta)
            ]);

            return {
                content,
                customStyle
            };
        });

        return m('#projects-home-component', {
                oncreate: h.setPageTitle(window.I18n.t('header_html', I18nScope())) 
            },
            [
                m(slider, {
                    slides: slides(),
                    effect: 'fade',
                    slideClass: 'hero-slide start',
                    wrapperClass: 'hero-full hero-full-slide',
                    sliderTime: 10000
                }),
                m(projectsDisplay),
                (!state.hasFBAuth ? m(UnsignedFriendFacebookConnect, { largeBg: true }) : ''),
                m(blogBanner)
            ]
        );
    }
};

export default projectsHome;
