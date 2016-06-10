import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import h from '../h';
import models from '../models';
import rewardVM from './reward-vm';
import userVM from './user-vm';

const idVM = h.idVM,
      projectDetails = m.prop([]),
      userDetails = m.prop([]),
      vm = postgrest.filtersVM({project_id: 'eq'});

const init = (project_id, project_user_id) => {
    vm.project_id(project_id);
    idVM.id(project_user_id);

    const lProject = postgrest.loaderWithToken(models.projectDetail.getRowOptions(vm.parameters())),
          lUser = postgrest.loaderWithToken(models.userDetail.getRowOptions(idVM.parameters())),
          isLoading = () => { return (lProject() || lUser() || lReward()); };

        lUser.load().then(userDetails);

    lProject.load().then((data) => {

        rewardVM.fetchRewards(project_id);
        projectDetails(data);
    });
};

const projectVM = {
        projectDetails: _.compose(_.first, projectDetails),
        userDetails: userDetails,
        rewardDetails: rewardVM.rewards,
        isLoading: isLoading,
        init: init
    };
};

export default projectVM;
