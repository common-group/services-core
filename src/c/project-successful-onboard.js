/**
 * window.c.ProjectSuccessfulOnboard component
 * render first interaction of successful project onboarding
 * used when project is successful and wants to confirm bank data and request transfer
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboard, {project: project})
 **/

window.c.ProjectSuccessfulOnboard = ((m, c, models, h, _) => {
    return {
        controller: (args) => {
            let projectIdVM = m.postgrest.filtersVM({project_id: 'eq'}),
                projectAccounts = m.prop([]),
                projectTransfers = m.prop([]),
                currentStage = m.prop('ProjectSuccessfulOnboardStart'),
                loader = m.postgrest.loaderWithToken;

            projectIdVM.project_id(args.project.id);

            const lProjectAccount = loader(models.projectAccount.getRowOptions(projectIdVM.parameters()));
            lProjectAccount.load().then(projectAccounts);

            const lProjectTransfer = loader(models.projectTransfer.getRowOptions(projectIdVM.parameters()));
            lProjectTransfer.load().then(projectTransfers);

            const setStage = (stage) => {
                return () => {
                    console.log(stage);

                    const stages = {
                        'start': 'ProjectSuccessfulOnboardStart',
                        'confirm_account': 'ProjectSuccessfulOnboardConfirmAccount'
                    };

                    currentStage(stages[stage||'start']);
                    return currentStage();
                };
            };

            const loadCurrentStage = () => {
                if (!lProjectAccount() && !lProjectTransfer()) {
                    const pa = _.first(projectAccounts);

                    if (_.isNull(pa.error_reason) && _.isNull(pa.transfer_state)) {
                        return setStage('start')();
                    }
                }

                return void(0);
            };

            loadCurrentStage();

            return {
                projectAccounts: projectAccounts,
                projectTransfers: projectTransfers,
                lProjectAccount: lProjectAccount,
                lProjectTransfer: lProjectTransfer,
                setStage: setStage,
                currentStage: currentStage
            };
        },

        view: (ctrl, args) => {
            const projectAccount = _.first(ctrl.projectAccounts()),
                  projectTransfer = _.first(ctrl.projectTransfers()),
                  lpa = ctrl.lProjectAccount,
                  lpt = ctrl.lProjectTransfer;


            return m('.w-section.section', [
                (!lpa() && !lpt() ?
                 m.component(c[ctrl.currentStage()], {
                     projectTransfer: projectTransfer,
                     projectAccount: projectAccount,
                     setStage: ctrl.setStage
                 }) : '')

            ]);
        }
    };
}(window.m, window.c, window.c.models, window.c.h, window._));
