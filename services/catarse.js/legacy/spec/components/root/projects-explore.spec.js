import mq from 'mithril-query';
import projectsExplore from '../../../src/root/projects-explore';

describe('ProjectsExplore', () => {
    let $output, project, component;

    beforeAll(() => {
        window.onpopstate = function() {}
        window.location.hash = '#by_category_id/1';

        component = m(projectsExplore, { root: { getAttribute: (x) => { return null; }} });
        $output = mq(component);
    });

    it('should render search container', () => {
        $output.should.have('.hero-search');
    });

    describe('view', () => {

        let $outputWithSubscriptionsSelected, $outputWithAonFlexSelected, $outputAllModes;

        beforeAll(() => {
            $outputAllModes = mq(m(projectsExplore));
            $outputWithSubscriptionsSelected = mq(m(projectsExplore, { filter: 'sub' }));
            $outputWithAonFlexSelected = mq(m(projectsExplore, { filter: 'not_sub' }));
        });

        it('should render explore with all modes', () => {            
            expect($outputAllModes.contains('Todos os projetos')).toBeTrue();
        });

        it('should render explorer selecting subscriptions', () => {
            expect($outputWithSubscriptionsSelected.contains('Assinaturas')).toBeTrue();
            expect($outputWithSubscriptionsSelected.find('.explore-mobile-label').length).toEqual(2);
        });

        it('should render explorer selecting aon and flex', () => {
            expect($outputWithAonFlexSelected.contains('Projetos pontuais')).toBeTrue();
        });
    });
});
