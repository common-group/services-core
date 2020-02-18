import mq from 'mithril-query';
import prop from 'mithril/stream';
import h from '../../../src/h';
import projectsExplore from '../../../src/root/projects-explore';
import { loadProjectsWithConfiguredParameters } from '../../../src/vms/projects-explore-vm';
import projectFilters from '../../../src/vms/project-filters-vm';

describe('ProjectsExplore', () => {
    let $output, project, component;
    

    beforeAll(() => {
        // window.onpopstate = function() {}        

        component = m(projectsExplore, { root: { getAttribute: (x) => { return null; }} });
        $output = mq(component);
    });

    it('should render search container', () => {
        $output.should.have('.hero-search');
    });

    describe('view', () => {

        let $outputWithSubscriptionsSelected, $outputWithAonFlexSelected, $outputAllModes;
        let $outputSearch;
        let projectFiltersVM; 
        let filtersMap;

        beforeAll(() => {            
            // $outputSearch = mq(m(projectsExplore, { pg_search: 'SEARCH'}));
            $outputAllModes = mq(m(projectsExplore));
            $outputWithSubscriptionsSelected = mq(m(projectsExplore, { mode: 'sub' }));
            $outputWithAonFlexSelected = mq(m(projectsExplore, { mode: 'not_sub' }));
        });

        // it('should make a search request for projects', () => {
        //     $outputSearch.should.contain('SEARCH');
        // });

        it('should render explore with all modes', () => {  
            expect($outputAllModes.contains('Todos os projetos')).toBeTrue();
        });

        it('should render explorer selecting subscriptions', () => {
            expect($outputWithSubscriptionsSelected.contains('Assinaturas')).toBeTrue();
        });

        it('should render explorer selecting aon and flex', () => {
            expect($outputWithAonFlexSelected.contains('Projetos pontuais')).toBeTrue();
        });
    });
});
