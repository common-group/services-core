import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import { catarse } from '../api';
import models from '../models';
import h from '../h';
import modalBox from '../c/modal-box';
import surveyPreview from '../c/survey-preview';
import ownerMessageContent from '../c/owner-message-content';
import rewardCardBig from '../c/reward-card-big';
import userVM from '../vms/user-vm';
import projectVM from '../vms/project-vm';
import rewardVM from '../vms/reward-vm';
import addressForm from '../c/address-form';

const addressScope = _.partial(h.i18nScope, 'activerecord.attributes.address');

const surveysShow = {
    oninit: function(vnode) {
        const {
            survey_id
        } = vnode.attrs,
            contributionId = m.route.param('contribution_id'),
            survey = prop(),
            idVM = h.idVM,
            displayModal = h.toggleProp(false, true),
            showPreview = h.toggleProp(false, true),
            showThanks = h.toggleProp(false, true),
            finished = prop(false),
            countryName = prop(''),
            stateName = prop(''),
            answeredAt = prop(''),
            fields = prop({}),
            openQuestions = prop([]),
            multipleChoiceQuestions = prop([]),
            user = prop({}),
            reward = prop(),
            sendMessage = () => {
                displayModal(true);
            },
            vm = catarse.filtersVM({
                contribution_id: 'eq'
            }),
            surveyLoader = () => {
                vm.contribution_id(contributionId);

                return catarse.loaderWithToken(models.survey.getPageOptions(vm.parameters()));
            },
            preview = () => {
                if (survey().confirm_address) {
                    window.location.hash = '#address-form';
                    if (fields().validate()) {
                        scroll(0, 0);
                        showPreview.toggle();
                    }
                } else {
                    showPreview.toggle();
                }
            },
            sendAnswer = () => {
                const data = {};
                _.extend(data, {
                    survey_address_answers_attributes: {
                        addresses_attributes: fields().address()
                    }
                });
                _.extend(data, {
                    survey_open_question_answers_attributes: _.map(openQuestions(), question => ({
                        id: question.question.answer_id,
                        survey_open_question_id: question.question.id,
                        contribution_id: contributionId,
                        answer: question.value()
                    }))
                });
                _.extend(data, {
                    survey_multiple_choice_question_answers_attributes: _.map(multipleChoiceQuestions(), question => ({
                        id: question.question.answer_id,
                        contribution_id: contributionId,
                        survey_multiple_choice_question_id: question.question.id,
                        survey_question_choice_id: question.value()
                    }))
                });
                m.request({
                    method: 'PUT',
                    url: `/contributions/${contributionId}/surveys/${survey_id}/answer`,
                    data,
                    config: h.setCsrfToken
                }).then(() => {
                    scroll(0, 0);
                    showThanks.toggle();
                });
            };
        const loadSurvey = (el, isInitialized) => {
            if (!isInitialized) {
                surveyLoader().load().then((data) => {
                    survey(_.first(data));
                    finished(!_.isEmpty(survey().finished_at));
                    answeredAt(survey().survey_answered_at);
                    projectVM.fetchProject(survey().project_id);
                    rewardVM.rewardLoader(survey().reward_id).load().then(reward);
                    const surveyData = survey();
                    countryName(surveyData.country_name);
                    stateName(surveyData.state_name);

                    idVM.id(h.getUserID());

                    const lUser = catarse.loaderWithToken(models.userDetail.getRowOptions(idVM.parameters()));

                    lUser.load().then((userData) => {
                        user(_.first(userData));
                        fields({
                            address: prop(surveyData.address || _.omit(user().address, 'id') || {})
                        });
                    });

                    _.map(surveyData.open_questions, (question) => {
                        openQuestions().push({
                            question,
                            value: prop(question.answer)
                        });
                    });
                    _.map(surveyData.multiple_choice_questions, (question) => {
                        multipleChoiceQuestions().push({
                            question,
                            value: prop(question.survey_question_choice_id)
                        });
                    });
                });
            }
        };

        return {
            projectVM,
            loadSurvey,
            countryName,
            stateName,
            user,
            preview,
            finished,
            fields,
            reward,
            sendMessage,
            displayModal,
            answeredAt,
            sendAnswer,
            showPreview,
            showThanks,
            openQuestions,
            multipleChoiceQuestions,
            survey
        };
    },
    view: function({state}) {
        const user = ctrl.user(),
            survey = ctrl.survey(),
            countryName = ctrl.countryName,
            stateName = ctrl.stateName,
            openQuestions = ctrl.openQuestions(),
            multipleChoiceQuestions = ctrl.multipleChoiceQuestions(),
            project = ctrl.projectVM.currentProject(),
            reward = _.first(ctrl.reward()),
            contactModalC = [ownerMessageContent, prop(project ? project.user : {})],
            profileImage = userVM.displayImage(user);

        return m('.survey', {
            config: ctrl.loadSurvey
        }, _.isEmpty(user) ? '' : [(ctrl.displayModal() ? m(modalBox, {
            displayModal: ctrl.displayModal,
            content: contactModalC
        }) : ''),
            ctrl.showThanks() ? m('.survey-thanks', [
                m('.bg-white.page-header',
                    m('.w-container',
                        m('.w-row', [
                            m('.w-col.w-col-2'),
                            m('.w-col.w-col-8', [
                                m('.u-marginbottom-20.u-text-center',
                                    m(`img.big.thumb.u-marginbottom-20.u-round[src='${profileImage}']`),
                                ),
                                m('.u-text-center',
                                    m('.fontsize-larger.u-marginbottom-10',
                                        'Valeu!'
                                    )
                                ),
                                m('.fontsize-base.u-text-center', [
                                    `As respostas abaixo foram enviadas para ${project.user.name}! Qualquer dúvida sobre o andamento do projeto, visite a `,
                                    m(`a.alt-link[href='/${project.permalink}#posts'][target='_blank']`,
                                        'aba de novidades da campanha'
                                    ),
                                    ' ou ',
                                    m('a.alt-link[href=\'javascript:void(0);\']', {
                                        onclick: ctrl.sendMessage
                                    },
                                        'envie uma mensagem'
                                    ),
                                    '.'
                                ])
                            ]),
                            m('.w-col.w-col-2')
                        ])
                    )
                ),
                m(surveyPreview, {
                    confirmAddress: survey.confirm_address,
                    countryName: countryName(),
                    stateName: stateName(),
                    fields: ctrl.fields().address(),
                    openQuestions,
                    multipleChoiceQuestions
                })
            ]) : ctrl.showPreview() ? m('.survey-preview', [
                m('.bg-white.page-header',
                    m('.w-container',
                        m('.w-row', [
                            m('.w-col.w-col-2'),
                            m('.w-col.w-col-8', [
                                m('.u-marginbottom-20.u-text-center',
                                    m(`img.big.thumb.u-marginbottom-20.u-round[src='${profileImage}']`),
                                ),
                                m('.u-text-center',
                                    m('.fontsize-larger',
                                        'Você confirma as respostas abaixo?'
                                    )
                                )
                            ]),
                            m('.w-col.w-col-2')
                        ])
                    )
                ),
                m(surveyPreview, {
                    confirmAddress: survey.confirm_address,
                    countryName: countryName(),
                    stateName: stateName(),
                    fields: ctrl.fields().address(),
                    openQuestions,
                    multipleChoiceQuestions
                }),
                m('div',
                    m('.w-container',
                        m('.w-row', [
                            m('.w-col.w-col-2'),
                            m('.w-col.w-col-8',
                                m('.w-row', [
                                    m('.w-col-small-6.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col',
                                        m('a.btn.btn-large.btn-terciary', {
                                            onclick: ctrl.showPreview.toggle
                                        },
                                            'Não'
                                        )
                                    ),
                                    m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6',
                                        m('a.btn.btn-large', {
                                            onclick: ctrl.sendAnswer
                                        },
                                            'Sim'
                                        )
                                    )
                                ])
                            ),
                            m('.w-col.w-col-2')
                        ])
                    )
                )

            ]) : m('.survey-show', (!survey || !project) ? h.loader() : [
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
                                    `${project.user.name}, do projeto ${project.name}, enviou algumas perguntas para que possa seguir com a produção e entrega da recompensa que você apoiou com R$${reward.minimum_value}:`
                                ),
                                m(rewardCardBig, {
                                    reward
                                })
                            ]),
                            m('.w-col.w-col-2')
                        ])
                    )
                ),
                (ctrl.finished() ? [
                    m('div',
                            m('.w-container',
                                m('.w-row', [
                                    m('.w-col.w-col-1'),
                                    m('.w-col.w-col-10',
                                        m('.card.card-terciary.medium.u-marginbottom-30', [
                                            m('.card.card-message.u-marginbottom-40.u-radius',
                                                m('.fontsize-base', [
                                                    m('span.fa.fa-exclamation-circle',
                                                        ''
                                                    ),
                                                    (ctrl.answeredAt() ?
                                                        m('span', ` Esse questionário não está mais aberto para receber respostas. Segue abaixo as respostas que você enviou no dia ${h.momentify(ctrl.answeredAt(), 'DD/MM/YYYY')}. Qualquer dúvida, `,
                                                            m('a.alt-link[href=\'javascript:void(0);\']', {
                                                                onclick: ctrl.sendMessage
                                                            },
                                                                `envie uma mensagem para ${project.user.name}`
                                                            )
                                                        ) :
                                                        m('span',
                                                            ` Oooops! Esse questionário não está mais aberto para respostas desde o dia ${h.momentify(ctrl.survey().finished_at, 'DD/MM/YYYY')}. Nossa recomendação é que você `,
                                                            m('a.alt-link[href=\'javascript:void(0);\']', {
                                                                onclick: ctrl.sendMessage
                                                            },
                                                                `envie uma mensagem para ${project.user.name}`
                                                            ),
                                                            ' para saber como é possível resolver o seu caso! ')
                                                    )
                                                ])
                                            )


                                        ])
                                    ),

                                    (ctrl.answeredAt() ?
                                        m(surveyPreview, {
                                            confirmAddress: survey.confirm_address,
                                            countryName: countryName(),
                                            stateName: stateName(),
                                            fields: ctrl.fields().address(),
                                            openQuestions,
                                            multipleChoiceQuestions
                                        }) : ''),
                                    m('.w-col.w-col-1')
                                ])
                            )
                        )
                ] : [
                    m('div',
                            m('.w-container',
                                m('.w-row', [
                                    m('.w-col.w-col-1'),
                                    m('.w-col.w-col-10',
                                        m('.card.card-terciary.medium.u-marginbottom-30', [
                                            (ctrl.answeredAt() ?
                                                m('.card.card-message.u-marginbottom-40.u-radius',
                                                    m('.fontsize-base', [
                                                        m('span.fa.fa-exclamation-circle',
                                                            ''
                                                        ),
                                                        ` Você já enviou as respostas abaixo no dia ${h.momentify(ctrl.answeredAt(), 'DD/MM/YYYY')}. Se notou algo errado, não tem problema: basta alterar as informações necessárias abaixo e reenviar as respostas.`
                                                    ])
                                                ) : ''),
                                            (survey.confirm_address ? [
                                                m('.fontcolor-secondary.fontsize-base.fontweight-semibold',
                                                        window.I18n.t('delivery_address', addressScope())
                                                    ),
                                                m(addressForm, {
                                                    countryName,
                                                    stateName,
                                                    fields: ctrl.fields
                                                })
                                            ] :
                                                ''),
                                            _.map(multipleChoiceQuestions, item =>
                                                m('.u-marginbottom-30.w-form', [
                                                    m('.fontcolor-secondary.fontsize-base.fontweight-semibold',
                                                        item.question.question
                                                    ),
                                                    m('.fontcolor-secondary.fontsize-smaller.u-marginbottom-20',
                                                        item.question.description
                                                    ), [

                                                        _.map(item.question.question_choices, choice =>
                                                            m('.fontsize-small.w-radio', [
                                                                m(`input.w-radio-input[type='radio'][name='choice${item.question.id}']`, {
                                                                    value: choice.id,
                                                                    checked: parseInt(choice.id) === parseInt(item.value()),
                                                                    onchange: m.withAttr('value', item.value)
                                                                }),
                                                                m("label.w-form-label[for='radio']",
                                                                    choice.option
                                                                )
                                                            ]))
                                                    ]
                                                ])),
                                            _.map(openQuestions, item =>
                                                m('.u-marginbottom-30.w-form', [
                                                    m('.fontcolor-secondary.fontsize-base.fontweight-semibold',
                                                        item.question.question
                                                    ),
                                                    m('.fontcolor-secondary.fontsize-smaller.u-marginbottom-20',
                                                        item.question.description
                                                    ),
                                                    m("input.positive.text-field.w-input[maxlength='256'][placeholder='Sua resposta'][required='required'][type='text']", {
                                                        value: item.value(),
                                                        onchange: m.withAttr('value', item.value)
                                                    })
                                                ]))
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
                                        m('a.btn.btn-large', {
                                            onclick: () => {
                                                ctrl.preview();
                                            }
                                        },
                                            'Enviar'
                                        )
                                    ),
                                    m('.w-col.w-col-4')
                                ])
                            )
                        )
                ]


                )
            ])
        ]);
    }
};

export default surveysShow;
