window.c.root.ProjectsShow = ((m, c, _, h, vms) => {
    return {
        controller: (args) => {
            return vms.project(args.project_id, args.project_user_id);
        },

        view: (ctrl) => {
            const project = ctrl.projectDetails();
            return (!ctrl.isLoading()) ?
                m('.project-show', {
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
                ]) : h.loader();
        }
    };
}(window.m, window.c, window._, window.c.h, window.c.vms));
