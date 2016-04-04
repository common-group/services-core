/**
 * window.c.ProjectSuccessfulOnboard component
 * render first interaction of successful project onboarding
 * used when project is successful and wants to confirm bank data and request transfer
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboard, {project: project})
 **/

window.c.ProjectSuccessfulOnboard = ((m, c, models, h, _) => {
    const I18nScope = _.partial(h.i18nScope, 'projects.successful_onboard');

    return {
        controller: (args) => {

            const insightVM = c.vms.insight,
                  projectIdVM = m.postgrest.filtersVM({project_id: 'eq'}),
                  projectAccounts = m.prop([]),
                  projectTransfers = m.prop([]),
                  onboardComponents = {
                      'start': 'DashboardInfo',
                      'confirm_account': 'ProjectSuccessfulOnboardConfirmAccount',
                      'error_account': 'DashboardInfo',
                      'pending_transfer': 'DashboardInfo',
                      'finished': 'DashboardInfo'
                  },
                  currentState = m.prop('start'),
                  currentComponent = () => onboardComponents[currentState()],
                  content = () => insightVM.content(currentState(), {account: projectAccounts, transfer: projectTransfers}),
                  loader = m.postgrest.loaderWithToken,
                  declineAccountLoader = (errorMsg) => {
                      const pa = _.first(projectAccounts());

                      return m.postgrest.loaderWithToken(
                          models.projectAccountError.postOptions({
                              project_id: args.project().id,
                              reason: errorMsg
                          }));
                  },
                  acceptAccountLoader = m.postgrest.loaderWithToken(
                      models.projectAccount.postOptions({
                          project_id: args.project().id
                      })
                  );

            projectIdVM.project_id(args.project().id);

            const lProjectAccount = loader(models.projectAccount.getRowOptions(projectIdVM.parameters()));
            lProjectAccount.load().then((data) => {
                projectAccounts(data);

                loadCurrentStage();
            });

            const lProjectTransfer = loader(models.projectTransfer.getRowOptions(projectIdVM.parameters()));
            lProjectTransfer.load().then(projectTransfers);

            const setStage = (state) => {
                currentState(state);

                return currentComponent;
            },
                  nextStage = () => {
                      const keys = _.keys(onboardComponents),
                        nextKey = keys[_.indexOf(keys, currentState()) + 1];

                      currentState(nextKey);

                      return currentComponent;
                  },
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

                      return false;
                  },

                  // TODO: need to add an error validation to not null
                  addErrorReason = (errorProp) => {
                      return () => {
                          const fn = declineAccountLoader(errorProp());
                          fn.load().then(() => {
                              setStage('error_account')();
                          });

                          return false;
                      };
                  },

                  acceptAccount = () => {
                      acceptAccountLoader.load().then(() => {
                          setStage('pending_transfer')();
                      });

                      return false;
                  };

            return {
                projectAccounts: projectAccounts,
                projectTransfers: projectTransfers,
                lProjectAccount: lProjectAccount,
                lProjectTransfer: lProjectTransfer,
                setStage: setStage,
                nextStage: nextStage,
                currentComponent: currentComponent,
                addErrorReason: addErrorReason,
                acceptAccount: acceptAccount,
                acceptAccountLoader: acceptAccountLoader,
                content: content,
                declineAccountLoader: declineAccountLoader,
                loadCurrentStage: loadCurrentStage
            };
        },

        view: (ctrl, args) => {
            const projectAccount = _.first(ctrl.projectAccounts()),
                  projectTransfer = _.first(ctrl.projectTransfers()),
                  lpa = ctrl.lProjectAccount,
                  lpt = ctrl.lProjectTransfer;
            console.log('current component', ctrl.currentComponent());
            return m('.w-section.section', [
                (!lpa() && !lpt() ?
                 m.component(c[ctrl.currentComponent()], {
                     projectTransfer: projectTransfer,
                     projectAccount: projectAccount,
                     setStage: ctrl.setStage,
                     addErrorReason: ctrl.addErrorReason,
                     acceptAccount: ctrl.acceptAccount,
                     acceptAccountLoader: ctrl.acceptAccountLoader,
                     nextStage: ctrl.nextStage,
                     content: ctrl.content()
                 }) : h.loader())

            ]);
        }
    };
}(window.m, window.c, window.c.models, window.c.h, window._));
