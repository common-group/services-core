import m from 'mithril';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import models from '../models';
import surveyVM from '../vms/survey-vm';
import projectDashboardMenu from '../c/project-dashboard-menu';
import rewardCardBig from '../c/reward-card-big';
import surveyCreatePreview from '../c/survey-create-preview';
import dashboardMultipleChoiceQuestion from '../c/dashboard-multiple-choice-question';
import dashboardOpenQuestion from '../c/dashboard-open-question';
import inlineError from '../c/inline-error';

const I18nScope = _.partial(h.i18nScope, 'projects.reward_fields');

const surveyCreate = {
    controller(args) {
        const
            showError = m.prop(false),
            loader = postgrest.loaderWithToken,
            showPreview = h.toggleProp(false, true),
            confirmAddress = surveyVM.confirmAddress,
            projectDetails = m.prop([]),
            rewardFilterVM = postgrest.filtersVM({
                id: 'eq'
            }),
            filterVM = postgrest.filtersVM({
                project_id: 'eq'
            }),
            {
                project_id,
                reward_id
            } = args;

        rewardFilterVM.id(reward_id);
        filterVM.project_id(project_id);
        const rewardVM = postgrest.loaderWithToken(models.rewardDetail.getPageOptions(rewardFilterVM.parameters())),
            l = loader(models.projectDetail.getRowOptions(filterVM.parameters()));

        const reward = m.prop([]);
        l.load().then(projectDetails);
        rewardVM.load().then(reward);

        const choice = {
            multiple: [
                m('span.fa.fa-dot-circle-o'),
                '  Múltipla escolha'
            ],
            open: [
                m('span.fa.fa-align-left'),
                '  Resposta aberta'
            ]
        };

        const setQuestionType = (question, type) => () => {
            question.type = type;

            surveyVM.updateDashboardQuestion(question);
        };

        const choiceDropdown = question => m('.w-col.w-col-4.w-sub-col',
            m('.text-field.w-dropdown', {
                onclick: () => {
                    question.toggleDropdown.toggle();
                    surveyVM.updateDashboardQuestion(question);
                }
            }, [
                m('.dropdown-toggle.w-dropdown-toggle', [
                    choice[question.type],
                    m('span.fa.fa-chevron-down.u-right')
                ]),
                m('.card.dropdown-list.w-dropdown-list', {
                    class: question.toggleDropdown() ? 'w--open' : null
                }, [
                    m('span.dropdown-link.w-dropdown-link', {
                        onclick: setQuestionType(question, surveyVM.openQuestionType)
                    }, choice.open),
                    m('span.dropdown-link.w-dropdown-link', {
                        onclick: setQuestionType(question, surveyVM.multipleQuestionType)
                    }, choice.multiple)
                ])
            ])
        );

        const addDashboardQuestion = () => {
            surveyVM.addDashboardQuestion();

            return false;
        };

        const deleteDashboardQuestion = question => () => {
            surveyVM.deleteDashboardQuestion(question);

            return false;
        };

        const toggleShowPreview = () => {
            showError(false);

            if (surveyVM.isValid()) {
                h.scrollTop();
                showPreview(true);
            } else {
                showPreview(false);
                showError(true);
            }
        };

        const sendQuestions = () => {
            surveyVM.submitQuestions(reward_id).then(m.route(`/projects/${project_id}/surveys`)).catch(console.error);

            return false;
        };

        return {
            reward,
            showError,
            showPreview,
            toggleShowPreview,
            project_id,
            confirmAddress,
            projectDetails,
            choiceDropdown,
            addDashboardQuestion,
            deleteDashboardQuestion,
            sendQuestions
        };
    },
    view(ctrl) {
        const project = _.first(ctrl.projectDetails());
        const reward = _.first(ctrl.reward());
        return (project ? m('.project-surveys', (project.is_owner_or_admin ? m.component(projectDashboardMenu, {
            project: m.prop(project)
        }) : ''),
            ctrl.showPreview() ? m(surveyCreatePreview, { confirmAddress: ctrl.confirmAddress(), showPreview: ctrl.showPreview, surveyVM, reward, sendQuestions: ctrl.sendQuestions }) : [
            (reward ?
                m('.card-terciary.section.u-text-center',
                    m('.w-container',
                        m('.w-row', [
                            m('.w-col.w-col-8.w-col-push-2',
                                m('div', [
                                    m('.fontsize-small.fontweight-semibold.u-marginbottom-20',
                                        `Questionário para os ${reward.paid_count} apoiadores da recompensa`
                                    ),
                                    m(rewardCardBig, { reward })
                                ])
                            )
                        ])
                    )
                )
              : ''),
                m('.divider'),
                m('.section',
                m('.w-row', [
                    m('.w-col.w-col-10.w-col-push-1', [
                        m('.card.card-terciary.medium.u-marginbottom-20.u-text-center', [
                            m('.u-marginbottom-20', [
                                m('.fontsize-base.fontweight-semibold.u-marginbottom-10',
                                    'Confirmar endereço de entrega?'
                                ),
                                m('a.toggle.w-clearfix.w-inline-block', {
                                    class: ctrl.confirmAddress() ? 'toggle-on' : 'toggle-off',
                                    onclick: ctrl.confirmAddress.toggle
                                }, [
                                    m('.toggle-btn', {
                                        class: ctrl.confirmAddress() ? null : 'toggle-btn--off'
                                    }),
                                    ctrl.confirmAddress() ? m('.u-right', 'SIM') : m('.u-left', 'NÃO')
                                ]
                                ),
                                m('input[type="hidden"]', {
                                    name: 'reward[surveys_attributes][confirm_address]'
                                })
                            ]),
                            m('.w-row', [
                                m('.w-col.w-col-8.w-col-push-2',
                                    m('p.fontcolor-secondary.fontsize-small',
                                        'Se essa recompensa será entregue na casa dos apoiadores, deixe essa opção como "SIM". Dessa forma, incluíremos uma pergunta no questionário para que eles confirmem o endereço de entrega.'
                                    )
                                )
                            ])
                        ]),
                        _.map(surveyVM.dashboardQuestions(), (question, index) => m('.card.card-terciary.medium.u-marginbottom-20.w-row', [
                            ctrl.choiceDropdown(question),
                            m('.w-clearfix.w-col.w-col-8', [
                                m.component(
                                    question.type === 'multiple' ? dashboardMultipleChoiceQuestion : dashboardOpenQuestion,
                                    { question, index }
                                ),
                                m('button.btn.btn-inline.btn-no-border.btn-small.btn-terciary.fa.fa-lg.fa-trash.u-right', {
                                    onclick: ctrl.deleteDashboardQuestion(question)
                                })
                            ])

                        ])),
                        m('button.btn.btn-large.btn-message', {
                            onclick: ctrl.addDashboardQuestion
                        }, [
                            m('span.fa.fa-plus-circle'),
                            '  Adicionar pergunta'
                        ])
                    ])
                ])
            ),
                m('.section',
                m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-4.w-col-push-4',
                            m('a.btn.btn-large[href=\'javascript:void(0);\']', {
                                onclick: ctrl.toggleShowPreview
                            },
                                'Pré-visualizar'
                            ),
                            ctrl.showError() 
                                ? m('.u-text-center.u-margintop-10', m(inlineError, { message: 'Erro ao salvar formulário.' }))
                                : null
                        )
                    ])
                )
            )]
        ) : h.loader());
    }
};

export default surveyCreate;
