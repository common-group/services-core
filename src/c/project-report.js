import m from 'mithril';
import models from '../models';
import h from '../h';
import postgrest from 'mithril-postgrest';

const projectReport = {
        controller(args) {
          let displayForm = h.toggleProp(false, true),
              sendSuccess = m.prop(false),
              l = m.prop(false),
              sendReport = () => {
                let loaderOpts = models.projectReport.postOptions({
                    email: document.getElementById('report-email').value,
                    details: document.getElementById('report-details').value,
                    reason: document.getElementById('report-reason').value,
                    project_id: h.getCurrentProject()['project_id']
                });
                l = postgrest.loaderWithToken(loaderOpts);

                l.load().then(sendSuccess(true));
                return false;
              };

          return {
            displayForm: displayForm,
            sendSuccess: sendSuccess,
            sendReport: sendReport
          };
        },

        view(ctrl, args) {
          const user = h.getUser();
          return m('.card.card-terciary.u-radius',
                      [
                        m('.fontsize-small.u-marginbottom-20',
                          [
                            'Este projeto desrespeita',
                            m.trust('&nbsp;'),
                            m('a.alt-link[href=\'#\']',
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
                          m('.a.w-button.btn.btn-medium.btn-terciary.btn-inline[href=\'javascript:void(0);\']',{onclick: ctrl.displayForm.toggle},
                          'Denunciar este projeto'
                        ),
                        ctrl.displayForm() ? m('#report-form.u-margintop-30',
                          m('.w-form',
                            m('form', {onsubmit: ctrl.sendReport},
                              [
                                m('.fontsize-small.fontweight-semibold.u-marginbottom-10',
                                  'Por que você está denunciando este projeto?'
                                ),
                                m('select.w-select.text-field.positive[id="report-reason"][required=\'required\']',
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
                                m('textarea.w-input.text-field.positive.u-marginbottom-30[id=\'report-details\'][placeholder=\'Por favor, dê mais detalhes que nos ajudem a identificar o problema\']'),
                                m('.fontsize-small.fontweight-semibold.u-marginbottom-10',
                                  'Seu email'
                                ),
                                m(`input.w-input.text-field.positive.u-marginbottom-30[id=\'report-email\'][required=\'required\'][type=\'text\'][value="${user ? user.email : ''}"]`),
                                m('input.w-button.btn.btn-medium.btn-inline.btn-dark[type=\'submit\'][value=\'Enviar denúncia\']')
                              ]
                            )
                          )
                        ) : '']

                      ]
                    );
        }
};

export default projectReport;
