import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import models from '../models';

const projectVM = (project_id, project_user_id) => {
    const vm = postgrest.filtersVM({
        project_id: 'eq'
    }),
          idVM = h.idVM,
          projectDetails = m.prop([]),
          userDetails = m.prop([]),
          rewardDetails = m.prop([]);

    vm.project_id(project_id);
    idVM.id(project_user_id);

    const lProject = postgrest.loaderWithToken(models.projectDetail.getRowOptions(vm.parameters())),
          lUser = postgrest.loaderWithToken(models.userDetail.getRowOptions(idVM.parameters())),
          lReward = postgrest.loaderWithToken(models.rewardDetail.getPageOptions(vm.parameters())),
          isLoading = () => { return (lProject() || lUser() || lReward()); };

    lProject.load().then((data) => {
        lUser.load().then(userDetails);
        lReward.load().then(rewardDetails);

        projectDetails(data);
    });

    return {
        projectDetails: _.compose(_.first, projectDetails),
        userDetails: userDetails,
        rewardDetails: rewardDetails,
        isLoading: isLoading
    };
};

export default projectVM;
