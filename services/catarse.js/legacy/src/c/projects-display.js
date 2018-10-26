import m from 'mithril';
import prop from 'mithril/stream';
import projectFilters from '../vms/project-filters-vm';
import models from '../models';
import { catarse } from '../api';
import _ from 'underscore';
import h from '../h';
import projectRow from './project-row';
import projectRowWithHeader from './project-row-with-header';


const projectsDisplay = {

    oninit: function(vnode) {

        const 
            EXPERIMENT_CASE_CURRENT = 'EXPERIMENT_CASE_CURRENT',
            EXPERIMENT_CASE_6SUBHOM = 'EXPERIMENT_CASE_6SUBHOM',
            EXPERIMENT_CASE_3SUBHOM = 'EXPERIMENT_CASE_3SUBHOM';


        // FIXED HOME CASE, 'EXPERIMENT_CASE_3SUBHOM'
        window.__GO_EXPE_NAME = EXPERIMENT_CASE_3SUBHOM;


        const 
            filters = projectFilters().filters,
            currentCase = prop(window.__GO_EXPE_NAME == EXPERIMENT_CASE_CURRENT),
            subHomeWith6 = prop(window.__GO_EXPE_NAME == EXPERIMENT_CASE_6SUBHOM),
            subHomeWith3 = prop(window.__GO_EXPE_NAME == EXPERIMENT_CASE_3SUBHOM),
            sample6 = _.partial(_.sample, _, 6),
            sample3 = _.partial(_.sample, _, 3),
            loader = catarse.loaderWithToken,
            project = models.project,
            collectionsMap = ['score', 'contributed_by_friends'],
            subHomeWith6CollectionsFilters = ['not_sub', 'sub', 'contributed_by_friends'],
            windowEventNOTDispatched = true;
            
        
        project.pageSize(20);

        const collectionsMapper = (sample_no, name) => {
            const f = filters[name],
                cLoader = loader(project.getPageOptions(_.extend({}, { order: 'score.desc' }, f.filter.parameters()))),
                collection = prop([]);

            cLoader.load().then(_.compose(collection, sample_no));

            return {
                title: f.nicename,
                hash: (name === 'score' ? 'all' : name),
                collection,
                loader: cLoader,
                showFriends: (name === 'contributed_by_friends'),
                badges: !_.isUndefined(f.header_badges) ? f.header_badges : []
            };
        }

        const collections = _.map(collectionsMap, collectionsMapper.bind(collectionsMapper, sample6));
        const aonAndFlex_Sub_6 = _.map(subHomeWith6CollectionsFilters, collectionsMapper.bind(collectionsMapper, sample6));
        const aonAndFlex_Sub_3 = _.map(subHomeWith6CollectionsFilters, collectionsMapper.bind(collectionsMapper, sample3));

        window.addEventListener('optimize_load', (event) => {
            currentCase(window.__GO_EXPE_NAME == EXPERIMENT_CASE_CURRENT);
            subHomeWith6(window.__GO_EXPE_NAME == EXPERIMENT_CASE_6SUBHOM);
            subHomeWith3(window.__GO_EXPE_NAME == EXPERIMENT_CASE_3SUBHOM);
            console.log('Experiment Name:', window.__GO_EXPE_NAME)
        });

        return {
            collections,
            aonAndFlex_Sub_6,
            aonAndFlex_Sub_3,
            currentCase,
            subHomeWith6,
            subHomeWith3,
            windowEventNOTDispatched
        };
    },

    view: function(ctrl, args) {

        if (ctrl.windowEventNOTDispatched) {
            window.dispatchEvent(new Event('on_projects_controller_loaded'));
            ctrl.windowEventNOTDispatched = false;
        }


        if (ctrl.subHomeWith6()) {
            return m('div', 
                _.map(ctrl.aonAndFlex_Sub_6, (collection, index) => m(projectRowWithHeader, {
                    collection,
                    title: collection.title,
                    ref: `home_${(collection.hash === 'all' ? 'score' : collection.hash)}`,
                    showFriends: collection.showFriends,
                    isOdd: index & 1
                }))
            );
        }
        else if (ctrl.subHomeWith3()) {
            return m('div', _.map(ctrl.aonAndFlex_Sub_3, (collection, index) => m(projectRowWithHeader, {
                    collection,
                    title: collection.title,
                    ref: `home_${(collection.hash === 'all' ? 'score' : collection.hash)}`,
                    showFriends: collection.showFriends,
                    isOdd: index & 1
                }))
            );
        }
        else {
            return m('div', _.map(ctrl.collections, collection => m(projectRow, {
                collection,
                title: collection.title,
                ref: `home_${(collection.hash === 'all' ? 'score' : collection.hash)}`,
                showFriends: collection.showFriends
            }))
        );
        }
    }
};

export default projectsDisplay;