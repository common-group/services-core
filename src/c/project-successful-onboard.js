/**
 * window.c.ProjectSuccessfulOnboard component
 * render first interaction of successful project onboarding
 * used when project is successful and wants to confirm bank data and request transfer
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboard, {project: project})
 **/
import m from 'mithril';
import postgrest from 'mithril-postgrest';
import I18n from 'i18n-js';
import h from '../h';
import models from '../models';
import dashboardInfo from './dashboard-info';
import projectSuccessfulOnboardConfirmAccount from './project-successful-onboard-confirm-account';
import modalBox from './modal-box';
import successfulProjectTaxModal from './successful-project-tax-modal';
import insightVM from '../vms/insight-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.successful_onboard');

const projectSuccessfulOnboard = {
    controller(args) {
        const projectIdVM = postgrest.filtersVM({project_id: 'eq'}),
              projectAccounts = m.prop([]),
              projectTransfers = m.prop([]),
              showTaxModal = h.toggleProp(false, true),
              onboardComponents = {
                  'start': dashboardInfo,
                  'confirm_account': projectSuccessfulOnboardConfirmAccount,
                  'error_account': dashboardInfo,
                  'pending_transfer': dashboardInfo,
                  'finished': dashboardInfo
              },
              currentState = m.prop('start'),
              currentComponent = () => onboardComponents[currentState()],
              content = () => insightVM.content(currentState(), {
                  account: projectAccounts,
                  transfer: projectTransfers,
                  showTaxModal: showTaxModal
              }),
              loader = postgrest.loaderWithToken,
              declineAccountLoader = (errorMsg) => {
                  const pa = _.first(projectAccounts());

                  return postgrest.loaderWithToken(
                      models.projectAccountError.postOptions({
                          project_id: args.project().id,
                          reason: errorMsg
                      }));
              },
              acceptAccountLoader = postgrest.loaderWithToken(
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

                      if(_.isNull(pa)) {
                          return setStage('finished')();
                      }

                      if (_.isNull(pa.error_reason) && _.isNull(pa.transfer_state)) {
                          return setStage('start')();
                      } else if (!_.isNull(pa.error_reason)) {
                          return setStage('error_account')();
                      } else if (!_.isNull(pa.transfer_state)) {
                          if (pa.transfer_state == 'transferred') {
                              return setStage('finished')();
                          } else {
                              return setStage('pending_transfer')();
                          }
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
            loadCurrentStage: loadCurrentStage,
            showTaxModal: showTaxModal
        };
    },
    view(ctrl, args) {
        const projectAccount = _.first(ctrl.projectAccounts()),
              projectTransfer = _.first(ctrl.projectTransfers()),
              lpa = ctrl.lProjectAccount,
              lpt = ctrl.lProjectTransfer;

        return m('.w-section.section', [
            (ctrl.showTaxModal() ? m.component(modalBox, {
                displayModal: ctrl.showTaxModal,
                content: [successfulProjectTaxModal, {
                    projectTransfer: projectTransfer
                }]
            }) : ''),
            (!lpa() && !lpt() ?
             m.component(ctrl.currentComponent(), {
                 projectTransfer: projectTransfer,
                 projectAccount: projectAccount,
                 setStage: ctrl.setStage,
                 addErrorReason: ctrl.addErrorReason,
                 acceptAccount: ctrl.acceptAccount,
                 acceptAccountLoader: ctrl.acceptAccountLoader,
                 nextStage: ctrl.nextStage,
                 content: ctrl.content(),
                 dataToRedraw: {
                     'tax_link': {
                         action: 'onclick',
                         actionSource: () => {
                             ctrl.showTaxModal.toggle();
                             m.redraw();
                         }
                     }
                 }
             }) : h.loader())

        ]);
    }
};

export default projectSuccessfulOnboard;
