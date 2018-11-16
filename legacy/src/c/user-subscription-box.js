import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import moment from 'moment';
import models from '../models';
import {
    catarse
} from '../api';
import contributionVM from '../vms/contribution-vm';
import subscriptionVM from '../vms/subscription-vm';
import commonPaymentVM from '../vms/common-payment-vm';
import ownerMessageContent from '../c/owner-message-content';
import subscriptionStatusIcon from '../c/subscription-status-icon';
import paymentMethodIcon from '../c/payment-method-icon';
import cancelSubscriptionContent from '../c/cancel-subscription-content';
import modalBox from '../c/modal-box';
import checkboxUpdateIndividual from '../c/checkbox-update-individual';
import userVM from '../vms/user-vm';
import userSubscriptionPaymentHistoryModal from './user-subscription-payment-history-modal';


const I18nScope = _.partial(h.i18nScope, 'payment.state');
const contributionScope = _.partial(h.i18nScope, 'users.contribution_row');

const userSubscriptionBox = {
    controller: function(args) {
        const subscription = args.subscription,
            displayModal = h.toggleProp(false, true),
            displayCancelModal = h.toggleProp(false, true),
            displayPaymentHistoryModal = h.toggleProp(false, true),
            contactModalInfo = m.prop({}),
            isGeneratingSecondSlip = h.toggleProp(false, true);

        const filterProjVM = catarse.filtersVM({
                project_id: 'eq'
            }).project_id(subscription.project_external_id),
            lProj = catarse.loaderWithToken(models.project.getRowOptions(filterProjVM.parameters()));

        lProj.load().then((arr) => {
            subscription.project = arr[0];
            contactModalInfo({
                id: subscription.project.project_user_id,
                name: subscription.project.owner_name,
                project_id: subscription.project.project_id
            });
        });

        if (subscription.payment_method === 'boleto' && subscription.last_payment_id) {
            commonPaymentVM.paymentInfo(subscription.last_payment_id).then((info) => {
                subscription.boleto_url = info.boleto_url;
                subscription.boleto_expiration_date = info.boleto_expiration_date;
                subscription.payment_status = info.status;
            });
        }

        if (subscription.reward_external_id) {
            const filterRewVM = catarse.filtersVM({
                    id: 'eq'
                }).id(subscription.reward_external_id),
                lRew = catarse.loaderWithToken(models.rewardDetail.getRowOptions(filterRewVM.parameters()));

            lRew.load().then((arr) => {
                subscription.reward = arr[0];
            });
        }

        // Generate second slip payment and wait for result to update the view. In case of timeout, reloads the page.
        const generateSecondSlip = () => {
            isGeneratingSecondSlip.toggle();
            commonPaymentVM
                .tryRechargeSubscription(subscription.id)
                .then((info) => {
                    subscription.boleto_url = info.boleto_url;
                    subscription.boleto_expiration_date = info.boleto_expiration_date;
                    subscription.payment_status = info.status;
                    isGeneratingSecondSlip.toggle();
                    m.redraw();
                })
                .catch((e) => {
                    window.location.reload();
                });
        };

        const showLastSubscriptionVersionValueIfHasOne = () => {
            const is_active = subscription.status === 'active';
            const current_paid_subscription = subscription.current_paid_subscription;
            const last_paid_sub_amount = is_active || !current_paid_subscription ? subscription.checkout_data.amount : current_paid_subscription.amount;

            // has some subscription edition
            if (is_active && current_paid_subscription && current_paid_subscription.amount != subscription.checkout_data.amount) {
                const paid_value = parseFloat(current_paid_subscription.amount) / 100;
                const next_value = parseFloat(subscription.checkout_data.amount) / 100;
                return [
                    `R$ ${h.formatNumber(paid_value)} por mês`,
                    m('span.badge.badge-attention', [
                        m('span.fa.fa-arrow-right', ''),
                        m.trust('&nbsp;'),
                        `R$ ${h.formatNumber(next_value)}`,
                    ])
                ];
            }

            const paid_value = parseFloat(last_paid_sub_amount) / 100;
            return [`R$ ${h.formatNumber(paid_value)} por mês`];


            return '';
        };

        const showLastSubscriptionVersionPaymentMethodIfHasOne = () => {
            const is_active = subscription.status === 'active';
            const current_paid_subscription = subscription.current_paid_subscription;
            const last_paid_sub_data = is_active || !current_paid_subscription ? subscription : current_paid_subscription;

            if (is_active && current_paid_subscription && subscription.checkout_data.payment_method != current_paid_subscription.payment_method) {
                return [
                    m(subscriptionStatusIcon, { subscription }),
                    m.trust('&nbsp;&nbsp;&nbsp;'),
                    m(paymentMethodIcon, { subscription: current_paid_subscription }),
                    m('span.badge.badge-attention.fontweight-semibold', [
                        m('span.fa.fa-arrow-right', ''),
                        m.trust('&nbsp;'),
                        m(paymentMethodIcon, { subscription })
                    ])
                ];
            }

            return [
                m(subscriptionStatusIcon, { subscription }),
                m.trust('&nbsp;&nbsp;&nbsp;'),
                m(paymentMethodIcon, { subscription: last_paid_sub_data })
            ];


            return '';
        };

        const showLastSubscriptionVersionRewardTitleIfHasOne = () => {
            const is_active = subscription.status === 'active';
            const current_paid_subscription = subscription.current_paid_subscription;
            const current_reward_data = subscription.current_reward_data;
            const current_reward_id = subscription.current_reward_id;
            const last_paid_sub_data = is_active || !current_paid_subscription ? subscription : { reward: current_reward_data, reward_id: current_reward_id, reward_external_id: null };

            // first selection was no reward, but now selected one
            if (is_active && !current_reward_data && subscription.reward) {
                return [
                    ` ${window.I18n.t('no_reward', contributionScope())} `,
                    m.trust('&nbsp;'),
                    m('.fontsize-smallest.fontweight-semibold',
                      m('span.badge.badge-attention', [
                          m('span.fa.fa-arrow-right', ''),
                          m.trust('&nbsp;'),
                          subscription.reward.title
                      ]))
                ];
            }
	          // selected one rewared on subscription start, now selected another reward and last and current rewards are different
            else if (is_active && current_reward_data && subscription.reward && subscription.reward_id != current_reward_id) {
                const reward_description_formated = h.simpleFormat(`${current_reward_data.description.substring(0, 90)} (...)`);
                return [
                    m('.fontsize-smallest.fontweight-semibold', current_reward_data.title),
                    m('p.fontcolor-secondary.fontsize-smallest', m.trust(reward_description_formated)),
			              m('.fontsize-smallest.fontweight-semibold',
                      m('span.badge.badge-attention', [
                          m('span.fa.fa-arrow-right', ''),
                          m.trust('&nbsp;'),
                          subscription.reward.title
                      ]))
                ];
            }
	          // no edition to rewards yet
            else if (last_paid_sub_data.reward) {
                const reward_description = last_paid_sub_data.reward.description.substring(0, 90);
                const reward_description_formated = h.simpleFormat(`${reward_description} (...)`);
                return [
                    m('.fontsize-smallest.fontweight-semibold', last_paid_sub_data.reward.title),
                    m('p.fontcolor-secondary.fontsize-smallest', m.trust(reward_description_formated))
                ];
            }
	          // no editions to reward yet and no reward selected

            return [
                last_paid_sub_data.reward_external_id ? null : ` ${window.I18n.t('no_reward', contributionScope())} `
            ];
        };

        const showLastSubscriptionVersionEditionNextCharge = () => {
            const current_reward_data = subscription.current_reward_data;
            const current_reward_id = subscription.current_reward_id;
            const current_paid_subscription = subscription.current_paid_subscription;

            if (current_paid_subscription &&
                (
                    subscription.reward_id != current_reward_id ||
                    subscription.checkout_data.payment_method != current_paid_subscription.payment_method ||
                    subscription.checkout_data.amount != current_paid_subscription.amount
                )
            ) {
                const message = `As alterações destacadas entrarão em vigor na próxima cobrança ${h.momentify(subscription.next_charge_at, 'DD/MM/YYYY')}.`;
                return m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                    m('span.fa.fa-exclamation-triangle', ''),
                    m.trust('&nbsp;'),
                    message
                ]);
            }

            return '';
        };

        return {
            toggleAnonymous: userVM.toggleAnonymous,
            displayModal,
            displayCancelModal,
            displayPaymentHistoryModal,
            subscription,
            contactModalInfo,
            showLastSubscriptionVersionValueIfHasOne,
            showLastSubscriptionVersionPaymentMethodIfHasOne,
            showLastSubscriptionVersionRewardTitleIfHasOne,
            showLastSubscriptionVersionEditionNextCharge,
            isGeneratingSecondSlip,
            generateSecondSlip
        };
    },
    view: function(ctrl) {
        const 
            subscription = ctrl.subscription,
            project = subscription.project;

        return (!_.isEmpty(subscription) && !_.isEmpty(subscription.project) ? m('div',
            (ctrl.displayCancelModal() && !_.isEmpty(ctrl.contactModalInfo()) ?
                m.component(modalBox, {
                    displayModal: ctrl.displayCancelModal,
                    content: [cancelSubscriptionContent, {
                        displayModal: ctrl.displayCancelModal,
                        subscription
                    }]
                }) : ''
            ),
            (ctrl.displayModal() && !_.isEmpty(ctrl.contactModalInfo()) ?
                m.component(modalBox, {
                    displayModal: ctrl.displayModal,
                    content: [ownerMessageContent, ctrl.contactModalInfo]
                }) : ''
            ),
            (ctrl.displayPaymentHistoryModal() ? 
                m.component(modalBox, {
                    displayModal: ctrl.displayPaymentHistoryModal,
                    content: [userSubscriptionPaymentHistoryModal, { subscription, project }]
                })
            : ''), [
                m('.card.w-row', [
                    m('.u-marginbottom-20.w-col.w-col-3', [
                        m('.u-marginbottom-10.w-row', [
                            m('.u-marginbottom-10.w-col.w-col-4',
                                m(`a.w-inline-block[href='/${subscription.project.permalink}']`,
                                    m(`img.thumb-project.u-radius[alt='${subscription.project.project_name}'][src='${subscription.project.project_img}'][width='50']`)
                                )
                            ),
                            m('.w-col.w-col-8',
                                m('.fontsize-small.fontweight-semibold.lineheight-tight', [
                                    m(`a.link-hidden[href='/${subscription.project.permalink}']`,
                                        subscription.project.project_name
                                    ),
                                    m('img[alt="Badge Assinatura"][src="/assets/catarse_bootstrap/badge-sub-h.png"]')
                                ])
                            )
                        ]),
                        m("a.btn.btn-edit.btn-inline.btn-small.w-button[href='javascript:void(0);']", {
                            onclick: () => {
                                ctrl.displayModal.toggle();
                            }
                        },
                            window.I18n.t('contact_author', contributionScope())
                        )
                    ]),
                    m('.u-marginbottom-20.w-col.w-col-3', [
                        m('.fontsize-base.fontweight-semibold.lineheight-tighter', ctrl.showLastSubscriptionVersionValueIfHasOne()),
                        m('.fontcolor-secondary.fontsize-smaller.fontweight-semibold',
                            `Iniciou há ${moment(subscription.created_at).locale('pt').fromNow(true)}`
                        ),
                        m('.u-marginbottom-10', ctrl.showLastSubscriptionVersionPaymentMethodIfHasOne()),
                        m('a.alt-link.fontsize-smallest[href="javascript:void(0);"]', {
                            onclick: () => ctrl.displayPaymentHistoryModal.toggle()
                        },'Histórico de pagamento'),
                        m(checkboxUpdateIndividual, {
                            text: window.I18n.t('anonymous_sub', contributionScope()),
                            current_state: subscription.checkout_data.anonymous,
                            onToggle: () => subscriptionVM.toogleAnonymous(subscription)
                        })
                    ]),
                    m('.u-marginbottom-20.w-col.w-col-3', ctrl.showLastSubscriptionVersionRewardTitleIfHasOne()),
                    m('.u-marginbottom-10.u-text-center.w-col.w-col-3',
                        (subscription.status === 'started' ? (
                            subscription.last_payment_data.status === 'refused' && subscription.payment_method != 'boleto' ? [
                                m('.card-alert.u-radius.fontsize-smaller.u-marginbottom-10.fontweight-semibold',
                                    m('div',
                                        [
                                            m('span.fa.fa-exclamation-triangle', '.'),
                                            `Seu pagamento foi recusado em ${h.momentify(subscription.last_payment_data.refused_at)}. Vamos tentar uma nova cobrança em ${h.momentify(subscription.last_payment_data.next_retry_at)}`
                                        ]
                                    )
                                ),
                                m(`a.btn.btn-inline.btn-small.w-button[href='/projects/${subscription.project_external_id}/subscriptions/start?subscription_id=${subscription.id}${subscription.reward_external_id ? `&reward_id=${subscription.reward_external_id}` : ''}&subscription_status=inactive']`,
                                    'Refazer pagamento'
                                )
                            ] : (
                                subscription.payment_status === 'pending'
                                && subscription.boleto_url
                                && subscription.boleto_expiration_date ?
                                [
                                    moment(subscription.boleto_expiration_date).add(1, 'days').isBefore(Date.now())
                                    ? [
                                        m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                            m('span.fa.fa-exclamation-triangle'),
                                            ` O boleto de sua assinatura venceu dia ${h.momentify(subscription.boleto_expiration_date)}`,
                                        ]),
                                        (ctrl.isGeneratingSecondSlip() ? h.loader() :
                                            m('button.btn.btn-inline.btn-small.u-marginbottom-20.w-button', {
                                                disabled: ctrl.isGeneratingSecondSlip(),
                                                onclick: ctrl.generateSecondSlip
                                            }, 'Gerar segunda via'))
                                    ]
                                    : [
                                        m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                            m('span.fa.fa-exclamation-triangle'),
                                            ` O boleto de sua assinatura vence dia ${h.momentify(subscription.boleto_expiration_date)}`
                                        ]),
                                        m(`a.btn.btn-inline.btn-small.u-marginbottom-20.w-button[target=_blank][href=${subscription.boleto_url}]`, 'Imprimir boleto')
                                    ]
                                ] : (
                                    subscription.payment_status === 'pending' && subscription.payment_method != 'boleto' ? [
                                        m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                            m('span.fa.fa-exclamation-triangle'),
                                            m.trust('&nbsp;'),
                                            'Aguardando confirmação do pagamento'
                                        ])
                                    ] : ''
                                )
                            )

                        ) :
                            (subscription.status === 'inactive' ? [
                                (subscription.payment_status === 'pending'
                                    && subscription.boleto_url
                                    && subscription.boleto_expiration_date ? [
                                        m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                            m('span.fa.fa-exclamation-triangle'),
                                            ` O boleto de sua assinatura vence dia ${h.momentify(subscription.boleto_expiration_date)}`
                                        ]),
                                        m(`a.btn.btn-inline.btn-small.w-button[target=_blank][href=${subscription.boleto_url}]`, 'Imprimir boleto')
                                    ] : [
                                        m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                            m('span.fa.fa-exclamation-triangle'),
                                            m.trust('&nbsp;'),
                                            'Sua assinatura está inativa por falta de pagamento'
                                        ]),
                                        m(`a.btn.btn-inline.btn-small.w-button[target=_blank][href=/projects/${subscription.project_external_id}/subscriptions/start?subscription_id=${subscription.id}${subscription.reward_external_id ? `&reward_id=${subscription.reward_external_id}` : ''}&subscription_status=${subscription.status}]`, 'Assinar novamente')
                                    ])
                            ] : subscription.status === 'canceled' && subscription.project.state == 'online' ? [
                                m('a.btn.btn-terciary.u-marginbottom-20.btn-inline.w-button',
                                        { href: `/projects/${subscription.project_external_id}/subscriptions/start?subscription_id=${subscription.id}${subscription.reward_external_id ? `&reward_id=${subscription.reward_external_id}` : ''}&subscription_status=${subscription.status}` },
                                        'Reativar assinatura'
                                    ),
                                m('.card-error.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                    m('span.fa.fa-exclamation-triangle'),
                                    m.trust('&nbsp;'),
                                    ' Você cancelou sua assinatura'
                                ])
                            ] : subscription.status === 'canceling' ?
                                m('.u-radius.fontsize-smaller.u-marginbottom-10.fontweight-semibold.card-error',
                                    m('div', [
                                        m('span.fa.fa-exclamation-triangle',
                                            ' '
                                        ),
                                        ` Sua assinatura será cancelada no dia ${h.momentify(subscription.next_charge_at, 'DD/MM/YYYY')}. Até lá, ela ainda será considerada ativa.`
                                    ])
                                ) : (subscription.status === 'active' ? (
                                    subscription.last_payment_data.status == 'refused' ? [
                                        m('.card-alert.u-radius.fontsize-smaller.u-marginbottom-10.fontweight-semibold',
                                            m('div',
                                                [
                                                    m('span.fa.fa-exclamation-triangle', '.'),
                                                    `Seu pagamento foi recusado em ${h.momentify(subscription.last_payment_data.refused_at)}. Vamos tentar uma nova cobrança em ${h.momentify(subscription.last_payment_data.next_retry_at)}`
                                                ]
                                            )
                                        ),
                                        m(`a.btn.btn-inline.btn-small.w-button[href='/projects/${subscription.project_external_id}/subscriptions/start?subscription_id=${subscription.id}${subscription.reward_external_id ? `&reward_id=${subscription.reward_external_id}` : ''}&subscription_status=inactive']`,
                                            'Refazer pagamento'
                                        )
                                    ] : [
                                        ctrl.showLastSubscriptionVersionEditionNextCharge(),
                                        subscription.payment_status !== 'pending' ? m('a.btn.btn-terciary.u-marginbottom-20.btn-inline.w-button',
                                        { href: `/projects/${subscription.project_external_id}/subscriptions/start?${subscription.reward_external_id ? `reward_id=${subscription.reward_external_id}` : ''}&subscription_id=${subscription.id}&subscription_status=${subscription.status}` },
                                        'Editar assinatura'
                                    ) : '',
                                        subscription.payment_status === 'pending'
                                    && subscription.boleto_url
                                    && subscription.boleto_expiration_date ?
                                        [
                                            moment(subscription.boleto_expiration_date).add(1, 'days').isBefore(Date.now())
                                            ? [
                                                m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                                    m('span.fa.fa-exclamation-triangle'),
                                                    ` O boleto de sua assinatura venceu dia ${h.momentify(subscription.boleto_expiration_date)}`,
                                                ]),
                                                (ctrl.isGeneratingSecondSlip() ? h.loader() :
                                                    m('button.btn.btn-inline.btn-small.u-marginbottom-20.w-button', {
                                                        disabled: ctrl.isGeneratingSecondSlip(),
                                                        onclick: ctrl.generateSecondSlip
                                                    }, 'Gerar segunda via'))
                                            ]
                                            : [
                                                m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                                    m('span.fa.fa-exclamation-triangle'),
                                                    ` O boleto de sua assinatura vence dia ${h.momentify(subscription.boleto_expiration_date)}`
                                                ]),
                                                m(`a.btn.btn-inline.btn-small.u-marginbottom-20.w-button[target=_blank][href=${subscription.boleto_url}]`, 'Imprimir boleto')
                                            ]
                                        ] : '',
                                        m('button.btn-link.fontsize-smallest.link-hidden-light', {
                                            onclick: () => {
                                                ctrl.displayCancelModal.toggle();
                                            }
                                        },
                                        'Cancelar assinatura'
                                    )
                                    ]) : null)

                            ))
                    )
                ])
            ]
        ) : m('div', ''));
    }
};

export default userSubscriptionBox;
