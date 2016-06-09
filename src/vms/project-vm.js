import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import h from '../h';
import models from '../models';
import rewardVM from './reward-vm';

const projectVM = (project_id, project_user_id) => {
    const vm = postgrest.filtersVM({
        project_id: 'eq'
    }),
          idVM = h.idVM,
          projectDetails = m.prop([]),
          userDetails = m.prop([]);

    vm.project_id(project_id);
    idVM.id(project_user_id);

    const lProject = postgrest.loaderWithToken(models.projectDetail.getRowOptions(vm.parameters())),
          lUser = postgrest.loaderWithToken(models.userDetail.getRowOptions(idVM.parameters())),
          isLoading = () => { return (lProject() || lUser() || lReward()); };

    lProject.load().then((data) => {
        lUser.load().then(userDetails);
        rewardVM.fetchRewards(project_id);
        projectDetails(data);
    });

    return {
        projectDetails: _.compose(_.first, projectDetails),
        userDetails: userDetails,
        rewardDetails: rewardVM.rewards,
        isLoading: isLoading
    };
};

export default projectVM;
