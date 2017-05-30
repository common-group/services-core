import m from 'mithril';
import _ from 'underscore';
import $ from 'jquery';
import I18n from 'i18n-js';
import postgrest from 'mithril-postgrest';
import models from '../models';
import paymentStatus from './payment-status';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.reward_fields');

const projectContributionReportContentCard = {
    controller(args) {
        const project = args.project(),
            showDetail = h.toggleProp(false, true),
            currentTab = m.prop('info'),
            checked = contribution => _.contains(args.selectedContributions(), contribution.id),
            selectContribution = (contribution) => {
                const anyChecked = $('input:checkbox').is(':checked');

                args.selectedAny(anyChecked);
                if (!checked(contribution)) {
                    args.selectedContributions().push(contribution.id);
                } else {
                    args.selectedContributions(_.without(args.selectedContributions(), contribution.id));
                }
                return true;
            },
            vm = postgrest.filtersVM({
                contribution_id: 'eq'
            }),
            surveyLoader = () => {
                vm.contribution_id(args.contribution().id);

                return postgrest.loaderWithToken(models.survey.getPageOptions(vm.parameters()));
            },
            survey = m.prop(),
            stateClass = (state) => {
                const classes = {
                    online: {
                        paid: 'text-success.fa-circle',
                        refunded: 'text-error.fa-circle',
                        pending_refund: 'text-error.fa-circle',
                        pending: 'text-waiting.fa-circle',
                        refused: 'text-error.fa-circle'
                    },
                    failed: {
                        paid: 'text-error.fa-circle-o',
                        refunded: 'text-refunded.fa-circle',
                        pending_refund: 'text-refunded.fa-circle-o',
                        pending: 'text-refunded',
                        refused: 'text-refunded'
                    },
                    waiting_funds: {
                        paid: 'text-success.fa-circle',
                        refunded: 'text-error.fa-circle',
                        pending_refund: 'text-error.fa-circle',
                        pending: 'text-waiting.fa-circle',
                        refused: 'text-error.fa-circle'
                    },
                    successful: {
                        paid: 'text-success.fa-circle',
                        refunded: 'text-error.fa-circle',
                        pending_refund: 'text-error.fa-circle',
                        pending: 'text-waiting.fa-circle',
                        refused: 'text-error.fa-circle'
                    }
                };

                return classes[project.state][state];
            };

        surveyLoader().load().then(survey);
        return {
            stateClass,
            survey,
            checked,
            currentTab,
            showDetail,
            selectContribution
        };
    },
    view(ctrl, args) {
        const contribution = args.contribution(),
            project = args.project(),
            survey = _.first(ctrl.survey()),
            profileImg = (_.isEmpty(contribution.profile_img_thumbnail) ? '/assets/catarse_bootstrap/user.jpg' : contribution.profile_img_thumbnail),
            reward = contribution.reward || {
                minimum_value: 0,
                description: 'Nenhuma recompensa selecionada'
            },
            deliveryBadge = () => (contribution.delivery_status === 'error' ?
                                                m('span.badge.badge-attention.fontsize-smaller',
                                                    'Erro no envio'
                                                ) : contribution.delivery_status === 'delivered' ?
                                                m('span.badge.badge-success.fontsize-smaller',
                                                    'Enviada'
                                                ) : contribution.delivery_status === 'received' ?
                                                m('span.fontsize-smaller.badge.badge-success', [
                                                    m('span.fa.fa-check-circle',
                                                        ''
                                                    ),
                                                    ' Recebida'
                                                ]) : '');

        return m('div', [m(`.w-clearfix.card${ctrl.checked(contribution) ? '.card-alert' : ''}`, [
            m('.w-row', [
                m('.w-col.w-col-1.w-col-small-1.w-col-tiny-1',
                        m('.w-inline-block',
                            m('.w-checkbox.w-clearfix',
                                (contribution.delivery_status !== 'received' && project.state !== 'failed' ?
                                    m('input.w-checkbox-input[type=\'checkbox\']', {
                                        checked: ctrl.checked(contribution),
                                        value: contribution.id,
                                        onclick: () => ctrl.selectContribution(contribution)
                                    }) : '')
                            )
                        )
                    ),
                m('.w-col.w-col-11.w-col-small-11.w-col-tiny-11',
                        m('.w-row', [
                            m('.w-col.w-col-1.w-col-tiny-1', [
                                m(`img.user-avatar.u-marginbottom-10[src='${profileImg}']`)
                            ]),
                            m('.w-col.w-col-11.w-col-tiny-11', [
                                m('.w-row', [
                                    m('.w-col.w-col-3', [
                                        m('.fontcolor-secondary.fontsize-mini.fontweight-semibold', h.momentify(contribution.created_at, 'DD/MM/YYYY, HH:mm')),
                                        m('.fontweight-semibold.fontsize-smaller.lineheight-tighter', contribution.user_name),
                                        m('.fontsize-smallest.lineheight-looser', [
                                            (contribution.has_another ? [
                                                m('a.link-hidden-light.badge.badge-light', '+1 apoio '),
                                            ] : ''),
                                            (contribution.anonymous ? m('span.fa.fa-eye-slash.fontcolor-secondary', m('span.fontcolor-secondary[style="font-size:11px;"]', ' Apoio não-público')) : '')
                                        ]),
                                        m('.fontsize-smallest.lineheight-looser', (contribution.email))
                                    ]),
                                    m('.w-col.w-col-3', [
                                        m('.lineheight-tighter', [
                                            m(`span.fa.fontsize-smallest.${ctrl.stateClass(contribution.state)}`),
                                            '   ',
                                            m('span.fontsize-large', `R$ ${h.formatNumber(contribution.value, 2, 3)}`)
                                        ])
                                    ]),
                                    m('.w-col.w-col-3.w-hidden-small.w-hidden-tiny', [
                                        m('div',
                                            deliveryBadge()
                                        ),
                                        m('.fontsize-smallest.fontweight-semibold', `Recompensa: ${reward.minimum_value ? h.formatNumber(reward.minimum_value, 2, 3) : ''}`),
                                        m('.fontsize-smallest.fontweight-semibold',
                                            reward.title
                                        ),
                                        m('.fontsize-smallest.fontcolor-secondary', `${reward.description.substring(0, 80)}...`)
                                    ]),
                                    (survey ?
                                    m('.w-col.w-col-3.w-col-push-1', [
                                        m('.fontsize-smallest', [
                                            m('a.link-hidden',
                                                'Questionário '
                                            ),
                                            m('span.fontweight-semibold.text-waiting',
                                                'enviado'
                                            )
                                        ]),
                                        m('.fontcolor-terciary.fontsize-smallest',
                                            `em ${h.momentify(survey.sent_at, 'DD/MM/YYYY')}`
                                        )
                                    ]) : '')
                                ])
                            ])
                        ])
                    )
            ]),
            m('a.arrow-admin.fa.fa-chevron-down.fontcolor-secondary.w-inline-block', {
                onclick: ctrl.showDetail.toggle
            })
        ]),
            (ctrl.showDetail() ?
                m('.card.details-backed-project.w-tabs', [
                    m('.w-tab-menu', [
                        m(`a.dashboard-nav-link.w-inline-block.w-tab-link${ctrl.currentTab() === 'info' ? '.w--current' : ''}`, { onclick: () => ctrl.currentTab('info') },
                            m('div',
                                'Info'
                            )
                        ),
                        m(`a.dashboard-nav-link.w-inline-block.w-tab-link${ctrl.currentTab() === 'profile' ? '.w--current' : ''}`, { onclick: () => ctrl.currentTab('profile') },
                            m('div',
                                'Perfil'
                            )
                        )
                    ]),
                    m('.card.card-terciary.w-tab-content', [
                        (ctrl.currentTab() === 'info' ?
                        m('.w-tab-pane.w--tab-active',
                            m('.w-row', [
                                m('.right-divider.w-col.w-col-6', [
                                    m('.u-marginbottom-20', [
                                        m('.fontsize-base.fontweight-semibold.u-marginbottom-10',
                                            `Valor do apoio: R$${contribution.value}`
                                        ),
                                        m(paymentStatus, { item: { payment_method: contribution.payment_method, state: contribution.state } }),
                                        m('.fontcolor-secondary.fontsize-smallest',
                                          h.momentify(contribution.created_at, 'DD/MM/YYYY hh:mm')
                                        )
                                    ]),
                                    m('.fontsize-base.fontweight-semibold',
                                        'Recompensa:'
                                    ),
                                    m('.fontsize-small.fontweight-semibold.u-marginbottom-10', [
                                        `R$${contribution.reward.minimum_value} ${contribution.reward.title ? `- ${contribution.reward.title}` : ''} `,
                                        deliveryBadge()
                                    ]),
                                    m('p.fontsize-smaller',
                                      contribution.reward.description
                                    ),
                                    m('.u-marginbottom-10', [
                                        m('.fontsize-smaller', [
                                            m('span.fontweight-semibold',
                                                'Entrega prevista: '
                                            ),
                                            h.momentify(reward.deliver_at, 'MMMM/YYYY')
                                        ]),
                                        m('.fontsize-smaller', [
                                            m('span.fontweight-semibold',
                                                'Envio: '
                                            ),
                                            I18n.t(`shipping_options.${reward.shipping_options}`, I18nScope())
                                        ])
                                    ])
                                ]),


                                m('.w-col.w-col-6', [
                                    m('.fontsize-base.fontweight-semibold',
                                        'Questionário'
                                    ),
                                    m('.fontsize-smaller.lineheight-tighter.u-marginbottom-20',
                                        'Respondido em 19/10/2015'
                                    ),
                                    m('.fontsize-small', [
                                        m('.fontweight-semibold.lineheight-looser',
                                            'Nome e endereço'
                                        ),
                                        m('p', [
                                            'Ciclana de Tals',
                                            m('br'),
                                            'Rua das Couves, 56',
                                            m('br'),
                                            'Bairro: cosme Velho',
                                            m('br'),
                                            '22241-090 Rio de janeiro-RJ',
                                            m('br'),
                                            'BRAZIL'
                                        ])
                                    ]),
                                    (survey ? [
                                        _.map(survey.multiple_choice_questions, (mc_question) => {
                                            const answer = _.find(mc_question.question_choices, choice => choice.id === mc_question.survey_question_choice_id);
                                            return m('.fontsize-small', [
                                                m('.fontweight-semibold.lineheight-looser',
                                              mc_question.question
                                          ),
                                                m('p',
                                                  answer.option
                                          )
                                            ]);
                                        }),
                                        _.map(survey.open_questions, open_question =>
                                      m('.fontsize-small', [
                                          m('.fontweight-semibold.lineheight-looser',
                                              open_question.question
                                          ),
                                          m('p',
                                              open_question.answer
                                          )
                                      ]))
                                    ] : '')
                                ])


                            ])
                        ) :
                        m('.w-tab-pane',
                            m('.fontsize-small',
                                m('p', [
                                    contribution.user_name,
                                    m('br'),
                                    contribution.email,
                                    m('br'),
                                    `Conta no Catarse desde ${h.momentify(contribution.user_created_at, 'MMMM YYYY')}`,
                                    m('br'),
                                    `Apoiou ${contribution.total_contributed_projects} projetos`,
                                    m('br'),
                                    `Criou ${contribution.total_published_projects} projetos`
                                ])
                            )
                        ))
                    ])
                ]) : '')
        ]);
    }
};

export default projectContributionReportContentCard;
