import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import models from '../models';
import h from '../h';
import userVM from '../vms/user-vm';
import userHeader from '../c/user-header';
import userCreated from '../c/user-created';
import userContributed from '../c/user-contributed';
import userAbout from '../c/user-about';

const surveysShow = {
    controller(args) {
        const { survey_id } = args;
        const survey = m.prop();
        const vm = postgrest.filtersVM({
            survey_id: 'eq'
        });
        const surveyLoader = () => {
            vm.survey_id(survey_id);

            return postgrest.loaderWithToken(models.survey.getPageOptions(vm.parameters()));
        };
        surveyLoader().load().then(survey);

        const user = userVM.getCurrentUser();

        return {
            user,
            survey_id,
            survey
        };
    },
    view(ctrl, args) {
        const user = ctrl.user(),
            survey = _.first(ctrl.survey()),
            profileImage = userVM.displayImage(user);
        console.log(survey);

        return m('.survey-show', [
            m('.dashboard-header.u-marginbottom-40.u-text-center',
                m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-2'),
                        m('.w-col.w-col-8', [
                            m(`img.big.thumb.u-marginbottom-20.u-round[src='${profileImage}']`),
                            m('.fontsize-larger.u-marginbottom-10',
                                `Oi, ${userVM.displayName(user)}`
                            ),
                            m('.fontsize-base.u-marginbottom-20',
                                'NOME_REALIZADOR, do projeto NOME_PROJETO, enviou algumas perguntas para que possa seguir com a produção e entrega da recompensa que você apoiou com R$50:'
                            ),
                            m('.card.u-radius', [
                                m('.fontsize-large.fontweight-semibold.u-marginbottom-10',
                                    'Título da recompensa'
                                ),
                                m('.fontcolor-secondary.fontsize-small.u-marginbottom-20',
                                    'Uma camisa com arte customizada feita pelo artista Fulano de Tal e o seu nome nos créditos do filme. Uma camisa com arte customizada feita pelo artista Fulano de Tal e o seu nome nos créditos do filme (...)'
                                ),
                                m('.fontcolor-secondary.fontsize-smallest', [
                                    m('span.fontcolor-terciary',
                                        'Entrega prevista:'
                                    ),
                                    ' Abril/2014 ',
                                    m.trust('&nbsp;'),
                                    ' ',
                                    m.trust('&nbsp;'),
                                    ' ',
                                    m('span.fontcolor-terciary',
                                        '|'
                                    ),
                                    ' ',
                                    m.trust('&nbsp;'),
                                    ' ',
                                    m.trust('&nbsp;'),
                                    ' ',
                                    m('span.fontcolor-terciary',
                                        'Envio:'
                                    ),
                                    ' Para todo o Brasil'
                                ])
                            ])
                        ]),
                        m('.w-col.w-col-2')
                    ])
                )
            ),
            m('div',
                m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-1'),
                        m('.w-col.w-col-10',
                            m('.card.card-terciary.medium.u-marginbottom-30', [
                                m('.card.card-message.u-marginbottom-40.u-radius',
                                    m('.fontsize-base', [
                                        m('span.fa.fa-exclamation-circle',
                                            '.'
                                        ),
                                        ' Você já enviou as respostas abaixo no dia 12/12/2017. Se notou algo errado, não tem problema: basta alterar as informações necessárias abaixo e reenviar as respostas.'
                                    ])
                                ),
                                m('.u-marginbottom-30.w-form', [
                                    m('.fontcolor-secondary.fontsize-base.fontweight-semibold.u-marginbottom-20',
                                        'Endereço de entrega'
                                    ),
                                    m("form[data-name='Email Form'][id='email-form'][name='email-form']", [
                                        m('.w-row', [
                                            m('._w-sub-col.w-col.w-col-6', [
                                                m("label.field-label.fontweight-semibold[for='field-4']",
                                                    'País / Country'
                                                ),
                                                m("select.positive.text-field.w-select[id='field-4'][name='field-4']", [
                                                    m("option[value='']",
                                                        'Select one...'
                                                    ),
                                                    m("option[value='First']",
                                                        'First Choice'
                                                    ),
                                                    m("option[value='Second']",
                                                        'Second Choice'
                                                    ),
                                                    m("option[value='Third']",
                                                        'Third Choice'
                                                    )
                                                ])
                                            ]),
                                            m('.w-col.w-col-6',
                                                m('.w-row', [
                                                    m('._w-sub-col-middle.w-col.w-col-6.w-col-small-6.w-col-tiny-6'),
                                                    m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6')
                                                ])
                                            )
                                        ]),
                                        m('div', [
                                            m("label.field-label.fontweight-semibold[for='email-41']",
                                                'Rua'
                                            ),
                                            m("input.positive.text-field.w-input[data-name='Email 41'][id='email-41'][maxlength='256'][name='email-41'][required='required'][type='email']")
                                        ]),
                                        m('.w-row', [
                                            m('._w-sub-col.w-col.w-col-4', [
                                                m("label.field-label.fontweight-semibold[for='email-48']",
                                                    'Número'
                                                ),
                                                m("input.positive.text-field.w-input[data-name='Email 48'][id='email-48'][maxlength='256'][name='email-48'][required='required'][type='email']")
                                            ]),
                                            m('.w-col.w-col-4', [
                                                m("label.field-label.fontweight-semibold[for='email-49']",
                                                    'Complemento'
                                                ),
                                                m("input.positive.text-field.w-input[data-name='Email 49'][id='email-49'][maxlength='256'][name='email-49'][required='required'][type='email']")
                                            ]),
                                            m('.w-col.w-col-4', [
                                                m("label.field-label.fontweight-semibold[for='email-50']",
                                                    'Bairro'
                                                ),
                                                m("input.positive.text-field.w-input[data-name='Email 50'][id='email-50'][maxlength='256'][name='email-50'][required='required'][type='email']")
                                            ])
                                        ]),
                                        m('.w-row', [
                                            m('._w-sub-col.w-col.w-col-4', [
                                                m("label.field-label.fontweight-semibold[for='email-51']",
                                                    'CEP'
                                                ),
                                                m("input.positive.text-field.w-input[data-name='Email 51'][id='email-51'][maxlength='256'][name='email-51'][required='required'][type='email']")
                                            ]),
                                            m('.w-col.w-col-4', [
                                                m("label.field-label.fontweight-semibold[for='email-52']",
                                                    'Cidade'
                                                ),
                                                m("input.positive.text-field.w-input[data-name='Email 52'][id='email-52'][maxlength='256'][name='email-52'][required='required'][type='email']")
                                            ]),
                                            m('.w-col.w-col-4', [
                                                m("label.field-label.fontweight-semibold[for='field-4']",
                                                    'Estado'
                                                ),
                                                m("select.positive.text-field.w-select[id='field-4'][name='field-4']", [
                                                    m("option[value='']",
                                                        'Select one...'
                                                    ),
                                                    m("option[value='First']",
                                                        'First Choice'
                                                    ),
                                                    m("option[value='Second']",
                                                        'Second Choice'
                                                    ),
                                                    m("option[value='Third']",
                                                        'Third Choice'
                                                    )
                                                ])
                                            ])
                                        ]),
                                        m('.w-row', [
                                            m('._w-sub-col.w-col.w-col-6', [
                                                m("label.field-label.fontweight-semibold[for='email-44']",
                                                    'Telefone'
                                                ),
                                                m("input.positive.text-field.w-input[data-name='Email 44'][id='email-44'][maxlength='256'][name='email-44'][required='required'][type='email']")
                                            ]),
                                            m('.w-col.w-col-6')
                                        ])
                                    ])
                                ]),
                                m('.u-marginbottom-30.w-form', [
                                    m('.fontcolor-secondary.fontsize-base.fontweight-semibold.u-marginbottom-20',
                                        'Tamanho da camisa'
                                    ),
                                    m("form[data-name='Email Form'][id='email-form'][name='email-form']", [
                                        m('.fontsize-small.w-radio', [
                                            m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"),
                                            m("label.w-form-label[for='radio']",
                                                'P'
                                            )
                                        ]),
                                        m('.fontsize-small.w-radio', [
                                            m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"),
                                            m("label.w-form-label[for='radio']",
                                                'M'
                                            )
                                        ]),
                                        m('.fontsize-small.w-radio', [
                                            m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"),
                                            m("label.w-form-label[for='radio']",
                                                'G'
                                            )
                                        ])
                                    ])
                                ]),
                                m('.u-marginbottom-30.w-form', [
                                    m('.fontcolor-secondary.fontsize-base.fontweight-semibold.u-marginbottom-20',
                                        'Qual o nome você quer nos créditos do filme?'
                                    ),
                                    m("form[data-name='Email Form'][id='email-form'][name='email-form']",
                                        m("input.positive.text-field.w-input[id='field'][maxlength='256'][name='field'][placeholder='Sua resposta'][required='required'][type='text']")
                                    )
                                ])
                            ])
                        ),
                        m('.w-col.w-col-1')
                    ])
                )
            ),

            m('.section',
                m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-4'),
                        m('.w-col.w-col-4',
                            m("a.btn.btn-large[href='/bellum/confirm-answer']",
                                'Enviar'
                            )
                        ),
                        m('.w-col.w-col-4')
                    ])
                )
            )


        ]);
    }
};

export default surveysShow;
