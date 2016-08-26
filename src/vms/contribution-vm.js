import postgrest from 'mithril-postgrest';
import models from '../models';


const getUserProjectContributions = (user_id, project_id) => {
    const vm = postgrest.filtersVM({user_id: 'eq', project_id: 'eq'});

    vm.user_id(user_id);
    vm.project_id(project_id);

    const lProjectContributions = postgrest.loaderWithToken(models.contributionDetail.getPageOptions(vm.parameters()));

    return lProjectContributions.load();
}

const contributionVM =  {
    getUserProjectContributions: getUserProjectContributions
};

export default contributionVM;
