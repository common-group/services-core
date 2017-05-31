import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import I18n from 'i18n-js';
import models from '../models';
import h from '../h';
import userVM from '../vms/user-vm';
import projectVM from '../vms/project-vm';
import rewardVM from '../vms/reward-vm';
import addressForm from '../c/address-form';

const I18nScope = _.partial(h.i18nScope, 'projects.reward_fields');

const surveysShow = {
    controller(args) {
        const {
            survey_id
        } = args,
            contributionId = m.route.param('contribution_id'),
            survey = m.prop(),
            answered = m.prop(false),
            answeredAt = m.prop(''),
            fields = m.prop(),
            openQuestions = m.prop([]),
            multipleChoiceQuestions = m.prop([]),
            user = userVM.getCurrentUser(),
            reward = m.prop(),
            vm = postgrest.filtersVM({
                contribution_id: 'eq'
            }),
            surveyLoader = () => {
                vm.contribution_id(contributionId);

                return postgrest.loaderWithToken(models.survey.getPageOptions(vm.parameters()));
            },
            sendAnswer = () => {
                const data = {};
                _.extend(data, { survey_address_answer: fields() });
                _.extend(data, { open_questions: _.map(openQuestions(), question => ({ id: question.question.id, value: question.value() })) });
                _.extend(data, { multiple_choice_questions: _.map(multipleChoiceQuestions(), question => ({ id: question.question.id, value: question.value() })) });
                m.request({
                    method: 'PUT',
                    url: `/contributions/${contributionId}/surveys/${survey_id}/answer`,
                    data,
                    config: h.setCsrfToken
                });
            };
        surveyLoader().load().then((data) => {
            survey(data);
            projectVM.fetchProject(_.first(survey()).project_id);
            rewardVM.rewardLoader(_.first(survey()).reward_id).load().then(reward);
            const surveyData = _.first(survey());
            fields(surveyData.address || {});
            _.map(surveyData.open_questions, (question) => {
                if (question.answer) {
                    answered(true);
                    answeredAt(question.answered_at);
                }
                openQuestions().push({ question, value: m.prop(question.answer) });
            });
            _.map(surveyData.multiple_choice_questions, (question) => {
                if (question.survey_question_choice_id) {
                    answered(true);
                    answeredAt(question.answered_at);
                }
                multipleChoiceQuestions().push({ question, value: m.prop(question.survey_question_choice_id) });
            });
        });

        return {
            projectVM,
            user,
            fields,
            reward,
            answered,
            answeredAt,
            sendAnswer,
            openQuestions,
            multipleChoiceQuestions,
            survey
        };
    },
    view(ctrl) {
        const user = ctrl.user(),
            survey = _.first(ctrl.survey()),
            openQuestions = ctrl.openQuestions(),
            multipleChoiceQuestions = ctrl.multipleChoiceQuestions(),
            project = ctrl.projectVM.currentProject(),
            reward = _.first(ctrl.reward()),
            profileImage = userVM.displayImage(user);

        return m('.survey-show', (!survey || !project) ? h.loader() : [
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
                            m('.card.u-radius', [
                                m('.fontsize-large.fontweight-semibold.u-marginbottom-10',
                                    reward.title
                                ),
                                m('.fontcolor-secondary.fontsize-small.u-marginbottom-20',
                                    reward.description
                                ),
                                m('.fontcolor-secondary.fontsize-smallest', [
                                    m('span.fontcolor-terciary',
                                        'Entrega prevista:'
                                    ),
                                    m.trust('&nbsp;'),
                                    h.momentify(reward.deliver_at, 'MMMM/YYYY'),
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
                                    m.trust('&nbsp;'),
                                    I18n.t(`shipping_options.${reward.shipping_options}`, I18nScope())
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
                                (ctrl.answered() ?
                                m('.card.card-message.u-marginbottom-40.u-radius',
                                    m('.fontsize-base', [
                                        m('span.fa.fa-exclamation-circle',
                                            ''
                                        ),
                                        ` Você já enviou as respostas abaixo no dia ${h.momentify(ctrl.answeredAt(), 'DD/MM/YYYY')}. Se notou algo errado, não tem problema: basta alterar as informações necessárias abaixo e reenviar as respostas.`
                                    ])
                                ) : ''),
                                (survey.confirm_address ?
                                  m(addressForm, { fields: ctrl.fields })
                                  : ''),
                                _.map(multipleChoiceQuestions, item =>
                                    m('.u-marginbottom-30.w-form', [
                                        m('.fontcolor-secondary.fontsize-base.fontweight-semibold.u-marginbottom-20',
                                            item.question.question
                                        ), [
                                            _.map(item.question.question_choices, choice =>
                                                m('.fontsize-small.w-radio', [
                                                    m(`input.w-radio-input[type='radio'][name='choice${item.id}']`, { value: choice.id, checked: choice.id === item.value(), onchange: m.withAttr('value', item.value) }),
                                                    m("label.w-form-label[for='radio']",
                                                        choice.option
                                                    )
                                                ]))
                                        ]
                                    ])),
                                _.map(openQuestions, item =>
                                    m('.u-marginbottom-30.w-form', [
                                        m('.fontcolor-secondary.fontsize-base.fontweight-semibold.u-marginbottom-20',
                                            item.question.question
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
                            m('a.btn.btn-large', { onclick: ctrl.sendAnswer },
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
