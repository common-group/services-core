window.c.project.Show = ((m, c, _, models, h) => {
    return {
        controller: (args) => {
            const vm = m.postgrest.filtersVM({
                    project_id: 'eq'
                }),
                idVM = h.idVM,
                projectDetails = m.prop([]),
                userDetails = m.prop([]),
                rewardDetails = m.prop([]);

            vm.project_id(args.project_id);
            idVM.id(args.project_user_id);

            const lProject = m.postgrest.loaderWithToken(models.projectDetail.getRowOptions(vm.parameters())),
                lUser = m.postgrest.loaderWithToken(models.userDetail.getRowOptions(idVM.parameters())),
                lReward = m.postgrest.loaderWithToken(models.rewardDetail.getPageOptions(vm.parameters()));

            lProject.load().then((data) => {
                lUser.load().then(userDetails);
                lReward.load().then(rewardDetails);

                projectDetails(data);
            });

            return {
                projectDetails: projectDetails,
                userDetails: userDetails,
                rewardDetails: rewardDetails,
                lProject: lProject,
                lUser: lUser,
                lReward: lReward
            };
        },

        view: (ctrl) => {
            return (!(ctrl.lProject() || ctrl.lUser() || ctrl.lReward())) ? _.map(ctrl.projectDetails(), (project) => {
                return m('.project-show', {
                    config: h.mixpanelTrack()
                }, [
                    m.component(c.ProjectHeader, {
                        project: project,
                        userDetails: ctrl.userDetails
                    }),
                    m.component(c.ProjectTabs, {
                        project: project,
                        rewardDetails: ctrl.rewardDetails
                    }),
                    m.component(c.ProjectMain, {
                        project: project,
                        rewardDetails: ctrl.rewardDetails
                    }),
                    (project.is_owner_or_admin ? m.component(c.ProjectDashboardMenu, {
                        project: project
                    }) : '')
                ]);
            }) : h.loader();
        }
    };
}(window.m, window.c, window._, window.c.models, window.c.h));
