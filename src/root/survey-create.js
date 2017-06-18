import m from 'mithril';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import models from '../models';
import surveyVM from '../vms/survey-vm';
import projectDashboardMenu from '../c/project-dashboard-menu';
import dashboardMultipleChoiceQuestion from '../c/dashboard-multiple-choice-question';
import dashboardOpenQuestion from '../c/dashboard-open-question';

const I18nScope = _.partial(h.i18nScope, 'projects.reward_fields');

const surveyCreate = {
    controller(args) {
        const
            loader = postgrest.loaderWithToken,
            confirmAddress = h.toggleProp(true, false),
            projectDetails = m.prop([]),
            rewardFilterVM = postgrest.filtersVM({
                id: 'eq'
            }),
            filterVM = postgrest.filtersVM({
                project_id: 'eq'
            }),
            {
                project_id
            } = args;

        rewardFilterVM.id(m.route.param('reward_id'));
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

        const choiceDropdown = (question) => m('.w-sub-col.w-col.w-col-4',
            m('.text-field.w-dropdown', {
                onclick: () => {
                    question.toggleDropdown.toggle();
                    surveyVM.updateDashboardQuestion(question);
                }
            }, [
                m('.dropdown-toggle.w-dropdown-toggle', choice[question.type]),
                m('.card.dropdown-list.w-dropdown-list', {
                    class: question.toggleDropdown() ? 'w--open' : null
                }, [
                    m('span.dropdown-link.w-dropdown-link', {
                        onclick: setQuestionType(question, 'open')
                    }, choice.open),
                    m('span.dropdown-link.w-dropdown-link',{
                        onclick: setQuestionType(question, 'multiple')
                    }, choice.multiple)
                ])
            ])
        );

        return {
            reward,
            project_id,
            confirmAddress,
            projectDetails,
            choiceDropdown
        };
    },
    view(ctrl) {
        const project = _.first(ctrl.projectDetails());
        const reward = _.first(ctrl.reward());
        return (project ? m('.project-surveys',
            (project.is_owner_or_admin ? m.component(projectDashboardMenu, {
                project: m.prop(project)
            }) : ''),
            (reward ?
                m('.card-terciary.section.u-text-center',
                    m('.w-container',
                        m('.w-row', [
                            m('.w-col.w-col-8.w-col-push-2',
                                m('div', [
                                    m('.fontsize-small.fontweight-semibold.u-marginbottom-20',
                                        `Questionário para os ${reward.paid_count} apoiadores da recompensa`
                                    ),
                                    m('.card.u-radius', [
                                        m('.fontsize-large.fontweight-semibold.u-marginbottom-10',
                                            `R$${reward.minimum_value} ou mais${reward.title ? `: ${reward.title}` : ''}`
                                        ),
                                        m('.fontcolor-secondary.fontsize-small.u-marginbottom-20',
                                            `${reward.description.substring(0, 140)}...`
                                        ),
                                        m('.fontcolor-secondary.fontsize-smallest', [
                                            m('span.fontcolor-terciary',
                                                'Entrega prevista: '
                                            ),
                                            h.momentify(reward.deliver_at, 'MMMM/YYYY'),
                                            m('span.fontcolor-terciary', '    |    '),
                                            m('span.fontcolor-terciary', 'Envio: '),
                                            I18n.t(`shipping_options.${reward.shipping_options}`, I18nScope())
                                        ])
                                    ])
                                ])
                            )
                        ])
                    )
                ) : ''),
            m('.divider'),
            m('.section',
                m('.w-row', [
                    m('.w-col.w-col-10.w-col-push-1', [
                        m('.card.card-terciary.medium.u-marginbottom-20.u-text-center', [
                            m('.u-marginbottom-20', [
                                m('.fontsize-base.fontweight-semibold.u-marginbottom-10',
                                    'Confirmar endereço de entrega?'
                                ),
                                m(`a.toggle.w-clearfix.w-inline-block`, {
                                        class: ctrl.confirmAddress() ? 'toggle-on' : 'toggle-off',
                                        onclick: ctrl.confirmAddress.toggle
                                    } , [
                                        m('.toggle-btn', {
                                            class: ctrl.confirmAddress() ? null : 'toggle-btn--off'
                                        }),
                                        ctrl.confirmAddress() ? m('.u-right', 'SIM') : m('.u-left', 'NÃO')
                                    ]
                                )
                            ]),
                            m('.w-row', [
                                m('.w-col.w-col-8.w-col-push-2',
                                    m('p.fontcolor-secondary.fontsize-small',
                                        'Se essa recompensa será entregue na casa dos apoiadores, deixe essa opção como "SIM". Dessa forma, incluíremos uma pergunta no questionário para que eles confirmem o endereço de entrega.'
                                    )
                                )
                            ])
                        ]),
                        _.map(surveyVM.dashboardQuestions(), (question) => m('.card.card-terciary.medium.u-marginbottom-20.w-row', [
                            ctrl.choiceDropdown(question),
                            m.component(
                                question.type === 'multiple' ? dashboardMultipleChoiceQuestion : dashboardOpenQuestion,
                                question
                            )
                        ])),
                        m("button.btn.btn-large.btn-message[href='#']", [
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
                            m("a.btn.btn-large[href='/bellum/poll-preview']",
                                'Pré-visualizar'
                            )
                        )
                    ])
                )
            )
        ) : h.loader());
    }
};

export default surveyCreate;
