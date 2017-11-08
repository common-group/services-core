/**
 * window.c.projectReport component
 * Render project report form
 *
 */
import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import models from '../models';
import h from '../h';
import projectVM from '../vms/project-vm';
import inlineError from './inline-error';

const projectReport = {
    controller(args) {
        const displayForm = h.toggleProp(false, true),
            sendSuccess = m.prop(false),
            submitDisabled = m.prop(false),
            user = h.getUser() || {},
            email = m.prop(user.email),
            details = m.prop(''),
            reason = m.prop(''),
            reasonError = m.prop(false),
            detailsError = m.prop(false),
            storeReport = 'report',
            project = projectVM.currentProject(),
            hasPendingAction = project && (h.callStoredAction(storeReport) == project.project_id),
            checkLogin = () => {
                if (!_.isEmpty(user)) {
                    displayForm.toggle();
                } else {
                    h.storeAction(storeReport, project.project_id);
                    return h.navigateToDevise();
                }
            },
            validate = () => {
                let ok = true;
                detailsError(false);
                reasonError(false);
                if (_.isEmpty(reason())) {
                    reasonError(true);
                    ok = false;
                }
                if (_.isEmpty(details())) {
                    detailsError(true);
                    ok = false;
                }
                return ok;
            },
            sendReport = () => {
                if (!validate()) {
                    return false;
                }
                submitDisabled(true);
                const loaderOpts = models.projectReport.postOptions({
                    email: email(),
                    details: details(),
                    reason: reason(),
                    project_id: project.project_id
                });
                const l = postgrest.loaderWithToken(loaderOpts);

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
            checkScroll,
            checkLogin,
            displayForm,
            sendSuccess,
            submitDisabled,
            sendReport,
            user,
            detailsError,
            reasonError,
            details,
            reason
        };
    },

    view(ctrl, args) {
        return m('.card.card-terciary.u-radius',
            [
                m('.fontsize-small.u-marginbottom-20',
                    [
                        'Este projeto desrespeita',
                        m.trust('&nbsp;'),
                        m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638\'][target=\'_blank\']',
                            'nossas regras? '
                          )
                    ]
                      ),
                ctrl.sendSuccess() ?
                       m('.w-form',
                        m('p',
                          'Obrigado! A sua denúncia foi recebida.'
                        )
                      ) :
                [
                    m('.a.w-button.btn.btn-medium.btn-terciary.btn-inline[href=\'javascript:void(0);\']', { onclick: ctrl.checkLogin },
                        'Denunciar este projeto'
                      ),
                    ctrl.displayForm() ? m('#report-form.u-margintop-30',
                        m('.w-form',
                          m('form', { onsubmit: ctrl.sendReport, config: ctrl.checkScroll },
                              [
                                  m('.fontsize-small.fontweight-semibold.u-marginbottom-10',
                                'Por que você está denunciando este projeto?'
                              ),
                                  m('select.w-select.text-field.positive[required=\'required\']', { onchange: m.withAttr('value', ctrl.reason) },
                                      [
                                          m('option[value=\'\']',
                                    'Selecione um motivo'
                                  ),
                                          m('option[value=\'Violação de propriedade intelectual\']',
                                    'Violação de propriedade intelectual'
                                  ),
                                          m('option[value=\'Calúnia, injúria, difamação ou discriminação\']',
                                    'Calúnia, injúria, difamação ou discriminação'
                                  ),
                                          m('option[value=\'Escopo de projeto proibido\']',
                                    'Escopo de projeto proibido'
                                  ),
                                          m('option[value=\'Recompensas proibidas\']',
                                    'Recompensas proibidas'
                                  ),
                                          m('option[value=\'Cenas de sexo explícitas e gratuitas\']',
                                    'Cenas de sexo explícitas e gratuitas'
                                  ),
                                          m('option[value=\'Abuso de SPAM\']',
                                    'Abuso de SPAM'
                                  ),
                                          m('option[value=\'Outros\']',
                                    'Outros'
                                  )
                                      ]
                              ),
                                  (ctrl.reasonError() ? m(inlineError, { message: 'Selecione um motivo' }) : ''),
                                  m('textarea.w-input.text-field.positive.u-marginbottom-30', { placeholder: 'Por favor, dê mais detalhes que nos ajudem a identificar o problema', onchange: m.withAttr('value', ctrl.details) }),
                                  m('.w-row',
                                  (ctrl.detailsError() ? m(inlineError, { message: 'Informe os detalhes da denúncia' }) : '')),
                                  m('input.w-button.btn.btn-medium.btn-inline.btn-dark[type=\'submit\'][value=\'Enviar denúncia\']', { disabled: ctrl.submitDisabled() })
                              ]
                          )
                        )
                      ) : '']

            ]
                  );
    }
};

export default projectReport;
