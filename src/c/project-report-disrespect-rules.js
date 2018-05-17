/**
  * window.c.projectReportDisrespectRules component
  * Render project report form
  *
  */
import m from 'mithril';
import _ from 'underscore';
import models from '../models';
import h from '../h';
import inlineError from './inline-error';

const projectReportDisrespectRules = {
    controller(args) {
        const formName = 'report-disrespect-rules';
        const reasonError = m.prop(false);
        const detailsError = m.prop(false);
        const validate = () => {
            let ok = true;
            detailsError(false);
            reasonError(false);
            if (_.isEmpty(args.reason())) {
                reasonError(true);
                ok = false;
            }
            if (_.isEmpty(args.details())) {
                detailsError(true);
                ok = false;
            }
            return ok;
        };

        return {
            formName: args.formName || formName,
            reasonError,
            detailsError,
            sendReport: args.sendReport.bind(args.sendReport, validate),
        };

    },
    view(ctrl, args) {
        return m('.card.u-radius.u-margintop-20',
          m('.w-form',
            m('form', {
                onsubmit: ctrl.sendReport,
                config: args.checkScroll
            },
              [
                  m('.report-option.w-radio',
                    [
                        m('input.w-radio-input[type=\'radio\']', {
                            value: ctrl.formName,
                            checked: args.displayFormWithName() === ctrl.formName,
                            onchange: m.withAttr('value', args.displayFormWithName)
                        }),
                        m('label.fontsize-small.fontweight-semibold.w-form-label[for=\'radio\']', {
                            onclick: _ => args.displayFormWithName(ctrl.formName)
                        },'Este projeto desrespeita nossas regras.')
                    ]
                   ),
                  m('.fontsize-smaller.fontcolor-secondary',
                    [
                        'Todos os projetos no Catarse precisam respeitar nossas',
                        m('a.alt-link.fontweight-semibold[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638\'][target=\'_blank\']', 
                          'Diretrizes de Criação de Projetos'
                         ),
                        ', entre elas não oferecer recompensas proibidas, não abusar de SPAM, não usar cenas de sexo explícitas ou nudez sem autorização.'
                    ]
                   ),
                  m('.u-margintop-30', {
                      style: {
                          display: args.displayFormWithName() === ctrl.formName ? 'block' : 'none'
                      }
                  },
                    [
                        m('select.text-field.positive.w-select[required=\'required\']', {
                            onchange: m.withAttr('value', args.reason),
                            class: {
                                error: ctrl.reasonError()
                            }
                        },
                          [
                              m('option[value=\'\']', 
                                'Selecione um motivo'
                               ),
                              m('option[value=\'Recompensas proibidas\']', 
                                'Recompensas proibidas'
                               ),
                              m('option[value=\'Calúnia, injúria, difamação ou discriminação\']', 
                                'Calúnia, injúria, difamação ou discriminação'
                               ),
                              m('option[value=\'Escopo de projeto proibido\']', 
                                'Escopo de projeto proibido'
                               ),
                              m('option[value=\'Cenas de sexo explícitas e gratuitas\']', 
                                'Cenas de sexo explícitas e gratuitas'
                               ),
                              m('option[value=\'Divulgação de materiais de nudez sem autorização\']', 
                                'Divulgação de materiais de nudez sem autorização'
                               )
                          ]
                         ),
                        (
                            ctrl.reasonError() ? m(inlineError, { message: 'Selecione um motivo' }) : ''
                        ),
                        m('.u-marginbottom-40',
                          [
                              m('.fontsize-smaller.fontweight-semibold', 
                                'Detalhes da denúncia *'
                               ),
                              m(`textarea.text-field.positive.w-input[maxlength='5000'][required='required']`, {
                                  onchange: m.withAttr('value', args.details),
                                  placeholder: 'Por favor, dê mais detalhes que nos ajudem a identificar o problema',
                                  class: {
                                      error: ctrl.detailsError()
                                  }
                              }),
                              (
                                  ctrl.detailsError() ? m(inlineError, {message: 'Informe os detalhes da denúncia' }) : ''
                              )
                          ]
                         ),
                        m('input.btn.btn-medium.btn-inline.btn-dark.w-button[type=\'submit\'][value=\'Enviar denúncia\']', {
                            disabled: args.submitDisabled()
                        })
                    ]
                   )
              ]
             )
           ));
    }
};

export default projectReportDisrespectRules;
