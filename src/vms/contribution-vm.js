import postgrest from 'mithril-postgrest';
import models from '../models';


const getUserProjectContributions = (user_id, project_id, states) => {
    const vm = postgrest.filtersVM({
        user_id: 'eq',
        project_id: 'eq',
        state: 'in'
    });

    vm.user_id(user_id);
    vm.project_id(project_id);
    vm.state(states);

    const lProjectContributions = postgrest.loaderWithToken(models.userContribution.getPageOptions(vm.parameters()));

    return lProjectContributions.load();
};

const contributionVM =  {
    getUserProjectContributions: getUserProjectContributions
};

export default contributionVM;
