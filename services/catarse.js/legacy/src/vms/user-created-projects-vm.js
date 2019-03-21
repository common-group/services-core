import models from '../models';
import prop from 'mithril/stream';
import { catarse } from '../api';
import m from 'mithril';

const createdProjects = catarse.paginationVM(models.project);

const getCreatedProjects = (user_id, states) => {
    
    const error = prop(false);
    const isLoading = prop(false);
    const contextVM = catarse.filtersVM({ project_user_id: 'eq', state: 'in' });
    contextVM.state(states).project_user_id(user_id).order({ updated_at: 'desc' });
    models.project.pageSize(9);

    return {
        error,
        isLoading,
        firstPage : () => {
            error(false);
            isLoading(true);

            return createdProjects
                .firstPage(contextVM.parameters())
                .then(_ => {
                    isLoading(false);
                    m.redraw();
                })
                .catch(err => {
                    error(true);
                    isLoading(false);
                    m.redraw();
                });
        },
        nextPage : () => {
            error(false);
            isLoading(true);

            return createdProjects
                .nextPage()
                .then(_ => {
                    isLoading(false);
                    m.redraw();
                })
                .catch(err => {
                    error(true);
                    isLoading(false);
                    m.redraw();
                });
        },
        isLastPage : createdProjects.isLastPage,
        collection : createdProjects.collection
    }
};

export default {
    getCreatedProjects
}