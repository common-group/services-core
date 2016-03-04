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
            const projectIdVM = m.postgrest.filtersVM({project_id: 'eq'}),
                  projectAccounts = m.prop([]),
                  projectTransfers = m.prop([]),
                  onboardStages = {
                      'start': 'ProjectSuccessfulOnboardStart',
                      'confirm_account': 'ProjectSuccessfulOnboardConfirmAccount',
                      'error_account': 'ProjectSuccessfulOnboardErrorAccount',
                      'pending_transfer': 'ProjectSuccessfulOnboardPendingTransfer',
                      'finished': 'ProjectSuccessfulOnboardFinished'
                  },
                  currentStage = m.prop(onboardStages['start']),
                  loader = m.postgrest.loaderWithToken,
                  declineAccountLoader = (errorMsg) => {
                      const pa = _.first(projectAccounts());

                      return m.postgrest.loaderWithToken(
                          models.projectAccountError.postOptions({
                              project_id: args.project.id,
                              reason: errorMsg
                          }));
                  },
                  acceptAccountLoader = m.postgrest.loaderWithToken(
                      models.projectAccount.postOptions({
                          project_id: args.project.id
                      })
                  );

            projectIdVM.project_id(args.project.id);

            const lProjectAccount = loader(models.projectAccount.getRowOptions(projectIdVM.parameters()));
            lProjectAccount.load().then((data) => {
                projectAccounts(data);
                loadCurrentStage();
            });

            const lProjectTransfer = loader(models.projectTransfer.getRowOptions(projectIdVM.parameters()));
            lProjectTransfer.load().then(projectTransfers);

            const setStage = (stage) => {
                return () => {
                    currentStage(onboardStages[stage]);

                    return currentStage();
                };},

                  loadCurrentStage = () => {
                      if (!lProjectAccount()) {
                          const pa = _.first(projectAccounts());

                          if (_.isNull(pa.error_reason) && _.isNull(pa.transfer_state)) {
                              return setStage('start')();
                          } else if (!_.isNull(pa.error_reason)) {
                              return setStage('error_account')();
                          } else if (!_.isNull(pa.transfer_state)) {
                              return setStage('pending_transfer')();
                          }
                      }

                      return void(0);
                  },

                  // TODO: need to add an error validation to not null
                  addErrorReason = (errorProp) => {
                      return () => {
                          const fn = declineAccountLoader(errorProp());
                          fn.load().then(() => {
                              setStage('error_account')();
                          });

                          return void(0);
                      };
                  },

                  acceptAccount = () => {
                      acceptAccountLoader.load().then(() => {
                          setStage('pending_transfer')();
                      });

                      return void(0);
                  };


            return {
                projectAccounts: projectAccounts,
                projectTransfers: projectTransfers,
                lProjectAccount: lProjectAccount,
                lProjectTransfer: lProjectTransfer,
                setStage: setStage,
                currentStage: currentStage,
                addErrorReason: addErrorReason,
                acceptAccount: acceptAccount,
                acceptAccountLoader: acceptAccountLoader,
                declineAccountLoader: declineAccountLoader,
                loadCurrentStage: loadCurrentStage
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
                     setStage: ctrl.setStage,
                     addErrorReason: ctrl.addErrorReason,
                     acceptAccount: ctrl.acceptAccount,
                     acceptAccountLoader: ctrl.acceptAccountLoader
                 }) : h.loader())

            ]);
        }
    };
}(window.m, window.c, window.c.models, window.c.h, window._));
