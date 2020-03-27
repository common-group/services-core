import { countProjects } from '../../../src/vms/projects-explore-vm';
import Postgrest from 'mithril-postgrest';

describe('ProjectExploreVM', () => {
    xit('should search projects with input text', () => {

    });

    xit('should search projects mode that are not subscription', () => {

    });

    xit('should search projects mode that are subscription', () => {

    });

    xit('should search projects that are popular', () => {

    });

    xit('should search projects that we love', () => {

    });

    xit('should search projects that were saved', () => {

    });

    xit('should search projects that recent', () => {

    });

    xit('should search projects that are nearly to end', () => {

    });

    xit('should search projects that are ended', () => {

    });

    xit('should retrieve cities state lists', () => {

    });

    describe('countProjects', () => {

        beforeAll(() => {
            jasmine.Ajax.stubRequest(
                `${apiPrefix}/projects?order=id.desc&city_name=eq.CITY_NAME&state_acronym=eq.STATE_ACRONYM&select=project_id`
            ).andReturn({
                responseHeaders: {
                    'Content-Range': '0-0/0',
                },
                responseText: '[{"project_id":1}]',
            });

            jasmine.Ajax.stubRequest(
                `${apiPrefix}/projects?order=id.desc&city_name=eq.CITY_NAME_2&state_acronym=eq.STATE_ACRONYM_2&select=project_id`
            ).andReturn({
                responseHeaders: {
                    'Content-Range': '0-1/1'
                },
                responseText: '[]',
            });
        });


        it('should retrieve number of projects on searched city and on state when there is no project on the city', async () => {
            const postgrest = new Postgrest();
            const countProjectsFilter = postgrest.filtersVM({ city_name: 'eq', state_acronym: 'eq' });
            countProjectsFilter.city_name('CITY_NAME').state_acronym('STATE_ACRONYM');
            const count = await countProjects(countProjectsFilter.parameters());
            expect(count).toBe(0);
        });

        it('should retrieve number of projects on searched city and on state', async () => {
            const postgrest = new Postgrest();
            const countProjectsFilter = postgrest.filtersVM({ city_name: 'eq', state_acronym: 'eq' });
            countProjectsFilter.city_name('CITY_NAME_2').state_acronym('STATE_ACRONYM_2');
            const count = await countProjects(countProjectsFilter.parameters());
            expect(count).toBe(1);
        });
    });
});