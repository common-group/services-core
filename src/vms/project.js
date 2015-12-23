window.c.vms.project = ((m, h, _, models) => {
    return (project_id, project_user_id) =>{
        const vm = m.postgrest.filtersVM({
            project_id: 'eq'
        }),
              idVM = h.idVM,
              projectDetails = m.prop([]),
              userDetails = m.prop([]),
              rewardDetails = m.prop([]);

        vm.project_id(project_id);
        idVM.id(project_user_id);

        const lProject = m.postgrest.loaderWithToken(models.projectDetail.getRowOptions(vm.parameters())),
              lUser = m.postgrest.loaderWithToken(models.userDetail.getRowOptions(idVM.parameters())),
              lReward = m.postgrest.loaderWithToken(models.rewardDetail.getPageOptions(vm.parameters())),
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
}(window.m, window.c.h, window._, window.c.models));
