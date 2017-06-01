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
import projectSuccessfulOnboardConfirmAccount from './project-successful-onboard-confirm-account';
import modalBox from './modal-box';
import successfulProjectTaxModal from './successful-project-tax-modal';
import insightVM from '../vms/insight-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.successful_onboard');

const projectSuccessfulOnboard = {
    controller(args) {
        const projectIdVM = postgrest.filtersVM({ project_id: 'eq' }),
              projectAccounts = m.prop([]),
              projectTransfers = m.prop([]),
              showTaxModal = h.toggleProp(false, true),
              loader = postgrest.loaderWithToken,
              listenToReplace = (element, isInitialized, context) => {
                  if (isInitialized) return;

                  const toRedraw = {
                      tax_link: {
                          action: 'onclick',
                          actionSource: () => {
                              showTaxModal.toggle();
                              m.redraw();
                          }
                      }
                  };

                  _.map(element.children, (item) => {
                      const toR = toRedraw[item.getAttribute('id')];

                      if (toR) {
                          item[toR.action] = toR.actionSource;
                      }
                  });
              };


        projectIdVM.project_id(args.project().project_id);

        const lProjectAccount = loader(models.projectAccount.getRowOptions(projectIdVM.parameters()));
        lProjectAccount.load().then((data) => {
            projectAccounts(data);
        });

        const lProjectTransfer = loader(models.projectTransfer.getRowOptions(projectIdVM.parameters()));
        lProjectTransfer.load().then(projectTransfers);


        return {
            projectAccounts,
            projectTransfers,
            lProjectAccount,
            lProjectTransfer,
            showTaxModal,
            listenToReplace
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
                    projectTransfer
                }]
            }) : ''),
            (!lpa() && !lpt() ?
             m('.w-container', [
                 m('.w-row.u-marginbottom-40', [
                     m('.w-col.w-col-6.w-col-push-3', [
                         m('.u-text-center', [
                             m('img.u-marginbottom-20', { src: I18n.t('start.icon', I18nScope()), width: 94 }),
                             m('.fontsize-large.fontweight-semibold.u-marginbottom-20', I18n.t('start.title', I18nScope())),
                             m('.fontsize-base.u-marginbottom-30', {
                                 config: ctrl.listenToReplace
                             }, m.trust(
                                 I18n.t('start.text', I18nScope({ total_amount: h.formatNumber(projectTransfer.total_amount, 2) })))),
                             m('a.btn.btn-large.btn-inline', { href: `/users/${args.project().user_id}/edit#balance` }, I18n.t('start.cta', I18nScope()))
                         ])
                     ])
                 ])
             ]) : h.loader())

        ]);
    }
};

export default projectSuccessfulOnboard;
