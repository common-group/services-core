import m from 'mithril';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import models from '../models';
import projectFilters from '../vms/project-filters-vm';
import homeVM from '../vms/home-vm';
import slider from '../c/slider';
import projectRow from '../c/project-row';
import blogBanner from './blog-banner';
import UnsignedFriendFacebookConnect from '../c/unsigned-friend-facebook-connect';

const I18nScope = _.partial(h.i18nScope, 'projects.home');

const projectsHome = {
    controller(args) {
        const sample6 = _.partial(_.sample, _, 6),
            loader = postgrest.loaderWithToken,
            project = models.project,
            filters = projectFilters().filters,
            userFriendVM = postgrest.filtersVM({ user_id: 'eq' }),
            friendListVM = postgrest.paginationVM(models.userFriend, 'user_id.desc', {
                Prefer: 'count=exact'
            }),
            currentUser = h.getUser() || {},
            hasFBAuth = currentUser.has_fb_auth,
            vm = homeVM();

        project.pageSize(20);

        userFriendVM.user_id(currentUser.user_id);

        if (hasFBAuth && !friendListVM.collection().length) {
            friendListVM.firstPage(userFriendVM.parameters());
        }

        const collections = _.map(['score', 'contributed_by_friends'], (name) => {
            const f = filters[name],
                cLoader = loader(project.getPageOptions(_.extend({}, { order: 'score.desc' }, f.filter.parameters()))),
                collection = m.prop([]);

            cLoader.load().then(_.compose(collection, sample6));

            return {
                title: f.nicename,
                hash: (name === 'score' ? 'all' : name),
                collection,
                loader: cLoader,
                showFriends: (name === 'contributed_by_friends')
            };
        });

        return {
            collections,
            slidesContent: vm.banners,
            hasFBAuth
        };
    },
    view(ctrl) {
        const slides = () => _.map(ctrl.slidesContent, (slide) => {
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

        return m('#projects-home-component', { config: h.setPageTitle(I18n.t('header_html', I18nScope())) }, [
            // m.component(menu, {transparent: true}),
            m.component(slider, {
                slides: slides(),
                effect: 'fade',
                slideClass: 'hero-slide start',
                wrapperClass: 'hero-full hero-full-slide',
                sliderTime: 10000
            }),
            _.map(ctrl.collections, collection => m.component(projectRow, {
                collection,
                title: collection.title,
                ref: `home_${(collection.hash === 'all' ? 'score' : collection.hash)}`,
                showFriends: collection.showFriends
            })),
            // m.component(contributionActivities),
            (!ctrl.hasFBAuth ? m.component(UnsignedFriendFacebookConnect, { largeBg: true }) : ''),
            m.component(blogBanner)
            // m.component(footer, {expanded: true}),
            // m.component(contributionActivities)
        ]);
    }
};

export default projectsHome;
