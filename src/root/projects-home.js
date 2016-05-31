import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import moment from 'moment';
import h from '../h';
import menu from './menu';
import models from '../models';
import projectFilters from '../vms/project-filters-vm';
import homeVM from '../vms/home-vm';
import slider from '../c/slider';
import projectRow from '../c/project-row';
import contributionActivities from '../c/contribution-activities';
import blogBanner from './blog-banner';
import footer from './footer';

const I18nScope = _.partial(h.i18nScope, 'projects.home');

const projectsHome = {
    controller() {
        let sample6 = _.partial(_.sample, _, 6),
            loader = postgrest.loader,
            project = models.project,
            filters = projectFilters().filters,
            vm = homeVM();

        project.pageSize(20);

        const collections = _.map(['score'], (name) => {
            const f = filters[name],
                  cLoader = loader(project.getPageOptions(_.extend({}, {order: 'score.desc'}, f.filter.parameters()))),
                  collection = m.prop([]);

            cLoader.load().then(_.compose(collection, sample6));

            return {
                title: f.title,
                hash: name,
                collection: collection,
                loader: cLoader
            };
        });

        return {
            collections: collections,
            slidesContent: vm.banners
        };
    },
    view(ctrl) {
        const slides = () => {
            return _.map(ctrl.slidesContent, (slide) => {
                const customStyle = `background-image: url(${slide.image});`;
                const content = m('.w-container.u-text-center',[
                    m('.w-row.u-marginbottom-40', [
                        m('h1.fontcolor-negative.fontsize-megajumbo.u-marginbottom-20', slide.title),
                        m('h2.fontcolor-negative.fontsize-large', m.trust(slide.subtitle))
                    ]),
                    m('a.btn.btn-large.u-marginbottom-10.btn-inline',{href: slide.link}, slide.cta)
                ]);

                return {
                    content: content,
                    customStyle: customStyle
                };
            });
        };

        return [
            m.component(menu, {transparent: true}),
            m.component(slider, {
                slides: slides(),
                effect: 'fade',
                slideClass: 'hero-slide start',
                wrapperClass: 'hero-full hero-full-slide',
                sliderTime: 10000
            }),
            _.map(ctrl.collections, (collection) => {
                return m.component(projectRow, {
                    collection: collection,
                    title: I18n.t('row_title', I18nScope()),
                    ref: `home_${collection.hash}`
                });
            }),
            m.component(contributionActivities),
            m.component(blogBanner),
            m.component(footer, {expanded: true})
        ];
    }
};

export default projectsHome;
