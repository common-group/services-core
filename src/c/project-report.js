/**
 * window.c.projectReport component
 * Render project report form
 *
 */
import m from 'mithril';
import _ from 'underscore';
import { catarse } from '../api';
import models from '../models';
import h from '../h';
import projectVM from '../vms/project-vm';
import inlineError from './inline-error';
import projectReportDisrespectRules from './project-report-disrespect-rules';
import projectReportInfringesIntellectualProperty from './project-report-infringes-intellectual-property';
import projectReportNoRewardReceived from './project-report-no-reward-received';

const projectReport = {
    controller: function(args) {
        const displayForm = h.toggleProp(false, true),
            displayFormWithName = m.prop(''),
            sendSuccess = m.prop(false),
            submitDisabled = m.prop(false),
            user = args && args.user ? args.user : (h.getUser() || {}),
            email = m.prop(user.email),
            details = m.prop(''),
            reason = m.prop(''),
            storeReport = 'report',
            project = args && args.project ? args.project : projectVM.currentProject(),
            hasPendingAction = project && (h.callStoredAction(storeReport) == project.project_id),
            CPF = m.prop(''),
            telephone = m.prop(''),
            businessName = m.prop(''),
            CNPJ = m.prop(''),
            businessRole = m.prop(''),
            relationWithViolatedProperty = m.prop(''),
            fullName = m.prop(''),
            fullAddress = m.prop(''),
            projectInfringes = m.prop(''),
            termsAgreed = h.toggleProp(false, true),
            checkLogin = (event) => {
                if (!_.isEmpty(user)) {
                    displayForm.toggle();
                } else {
                    h.storeAction(storeReport, project.project_id);
                    return h.navigateToDevise();
                }
            },
            sendReport = (validateFunction) => {
                if (!validateFunction()) {
                    return false;
                }
                submitDisabled(true);
                const loaderOpts = models.projectReport.postOptions({
                    email: email(),
                    details: details(),
                    reason: reason(),
                    data: {
                        email: email(),
                        details: details(),
                        reason: reason(),
                        cpf: CPF(),
                        telephone: telephone(),
                        business_name: businessName(),
                        cnpj: CNPJ(),
                        business_role: businessRole(),
                        relation_with_violated_property: relationWithViolatedProperty(),
                        full_name: fullName(),
                        project_infringes: projectInfringes(),
                        terms_agreed: termsAgreed(),
                    },
                    project_id: project.project_id
                });
                const l = catarse.loaderWithToken(loaderOpts);

                l.load().then(sendSuccess(true));
                submitDisabled(false);
                return false;
            },
            checkScroll = (el, isInit) => {
                if (!isInit && hasPendingAction) {
                    h.animateScrollTo(el);
                }
            };


        if (!_.isEmpty(user) && hasPendingAction) {
            displayForm(true);
        }

        return {
            displayFormWithName,
            checkScroll,
            checkLogin,
            displayForm,
            sendSuccess,
            submitDisabled,
            sendReport,
            user,
            details,
            reason,
            project: m.prop(project),
            user,
            CPF,
            telephone,
            businessName,
            CNPJ,
            businessRole,
            relationWithViolatedProperty,
            fullName,
            fullAddress,
            projectInfringes,
            termsAgreed
        };
    },

    view: function(ctrl, args) {
        return m('.card.card-terciary.u-radius', [
            ctrl.sendSuccess() ?
                    m('.w-form', m('p', 'Obrigado! A sua denúncia foi recebida.'))
                :
            [
                m('button.btn.btn-terciary.btn-inline.btn-medium.w-button',
                    {
                        onclick: ctrl.checkLogin
                    },
                          'Denunciar este projeto ao Catarse'
                        ),
                ctrl.displayForm() ?
                            m('div', [
                                m(projectReportDisrespectRules, {
                                    displayFormWithName: ctrl.displayFormWithName,
                                    submitDisabled: ctrl.submitDisabled,
                                    checkScroll: ctrl.checkScroll,
                                    sendReport: ctrl.sendReport,
                                    reason: ctrl.reason,
                                    details: ctrl.details,
                                }),
                                m(projectReportInfringesIntellectualProperty, {
                                    CPF: ctrl.CPF,
                                    telephone: ctrl.telephone,
                                    businessName: ctrl.businessName,
                                    CNPJ: ctrl.CNPJ,
                                    businessRole: ctrl.businessRole,
                                    relationWithViolatedProperty: ctrl.relationWithViolatedProperty,
                                    fullName: ctrl.fullName,
                                    fullAddress: ctrl.fullAddress,
                                    projectInfringes: ctrl.projectInfringes,
                                    termsAgreed: ctrl.termsAgreed,
                                    reason: ctrl.reason,
                                    details: ctrl.details,
                                    displayFormWithName: ctrl.displayFormWithName,
                                    sendReport: ctrl.sendReport,
                                    checkScroll: ctrl.checkScroll,
                                    submitDisabled: ctrl.submitDisabled
                                }),
                                m(projectReportNoRewardReceived, {
                                    displayFormWithName: ctrl.displayFormWithName,
                                    project: ctrl.project,
                                    user: ctrl.user
                                })
                            ])
                        :
                            ''
            ]
        ]);
    }
};

export default projectReport;
