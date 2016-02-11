window.c.root.ProjectsShow = ((m, c, _, h, vms) => {
    return {
        controller: (args) => {
            return vms.project(args.project_id, args.project_user_id);
        },

        view: (ctrl) => {
            let project = ctrl.projectDetails;

            return m('.project-show', [
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
                    (project() && project().is_owner_or_admin ? m.component(c.ProjectDashboardMenu, {
                        project: project
                    }) : '')
                ]);
        }
    };
}(window.m, window.c, window._, window.c.h, window.c.vms));
