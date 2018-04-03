import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import moment from 'moment';
import models from '../models';
import {
    catarse
} from '../api';
import contributionVM from '../vms/contribution-vm';
import commonPaymentVM from '../vms/common-payment-vm';
import ownerMessageContent from '../c/owner-message-content';
import subscriptionStatusIcon from '../c/subscription-status-icon';
import paymentMethodIcon from '../c/payment-method-icon';
import cancelSubscriptionContent from '../c/cancel-subscription-content';
import modalBox from '../c/modal-box';
import userVM from '../vms/user-vm';

const I18nScope = _.partial(h.i18nScope, 'payment.state');
const contributionScope = _.partial(h.i18nScope, 'users.contribution_row');

const userSubscriptionBox = {
    controller(args) {
        const subscription = args.subscription,
            displayModal = h.toggleProp(false, true),
            displayCancelModal = h.toggleProp(false, true),
            contactModalInfo = m.prop({});

        const filterProjVM = catarse.filtersVM({
                project_id: 'eq'
            }).project_id(subscription.project_external_id),
            lProj = catarse.loaderWithToken(models.project.getRowOptions(filterProjVM.parameters()));

        lProj.load().then(function(arr) {
            subscription.project = arr[0];
            contactModalInfo({
                id: subscription.project.project_user_id,
                name: subscription.project.owner_name,
                project_id: subscription.project.project_id
            });
        });

        if (subscription.payment_method === 'boleto' && subscription.last_payment_id) {
            commonPaymentVM.paymentInfo(subscription.last_payment_id).then(function(info) {
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

            lRew.load().then(function(arr) {
                subscription.reward = arr[0];
            });
        }

        return {
            toggleAnonymous: userVM.toggleAnonymous,
            displayModal,
            displayCancelModal,
            subscription,
            contactModalInfo
        };
    },
    view(ctrl) {
        const subscription = ctrl.subscription;

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
            ), [
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
                            I18n.t('contact_author', contributionScope())
                        )
                    ]),
                    m('.u-marginbottom-20.w-col.w-col-3', [
                        m('.fontsize-base.fontweight-semibold.lineheight-looser',
                            `R$ ${h.formatNumber(parseFloat((subscription.checkout_data||subscription).amount) / 100)} por mês`
                        ),
                        m('.fontcolor-secondary.fontsize-smaller.fontweight-semibold',
                            `Iniciou há ${moment(subscription.created_at).locale('pt').fromNow(true)}`
                        ),
                        m('.u-marginbottom-10', [
                            m(subscriptionStatusIcon, {subscription}),
                            m.trust('&nbsp;&nbsp;&nbsp;'),
                            m(paymentMethodIcon, {subscription})
                            
                        ])
                    ]),
                    m('.u-marginbottom-20.w-col.w-col-3', [
                        (subscription.reward ? [m('.fontsize-smallest.fontweight-semibold',
                            subscription.reward.title
                        ), m('p.fontcolor-secondary.fontsize-smallest', m.trust(h.simpleFormat(
                            `${subscription.reward.description.substring(0, 90)} (...)`
                        )))] : (subscription.reward_external_id ? null : ` ${I18n.t('no_reward', contributionScope())} `))
                    ]),
                    m('.u-marginbottom-10.u-text-center.w-col.w-col-3',
                        (subscription.status === 'started' ? [
                                m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                    m('span.fa.fa-exclamation-triangle'),
                                    m.trust('&nbsp;'),
                                    'Aguardando confirmação do pagamento'
                                ]),
                                (subscription.boleto_url ? m(`a.btn.btn-inline.btn-small.w-button[target=_blank][href=${subscription.boleto_url}]`, 'Imprimir boleto') : null)
                            ] :
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
                                        m(`a.btn.btn-inline.btn-small.w-button[target=_blank][href=/projects/${subscription.project_external_id}/subscriptions/start?subscription_id=${subscription.id}${subscription.reward_external_id ? '&reward_id=' + subscription.reward_external_id : ''}&subscription_status=${subscription.status}]`, 'Assinar novamente')
                                    ])
                            ] : subscription.status === 'canceled' && subscription.project.status == 'online' ? [
                                    m('a.btn.btn-terciary.u-marginbottom-20.btn-inline.w-button', 
                                        {href: `/projects/${subscription.project_external_id}/subscriptions/start?subscription_id=${subscription.id}${subscription.reward_external_id ? '&reward_id=' + subscription.reward_external_id : ''}&subscription_status=${subscription.status}`},
                                        'Reativar assinatura'
                                    ),
                                    m('.card-error.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                        m('span.fa.fa-exclamation-triangle'),
                                        m.trust('&nbsp;'),
                                        ' Você cancelou sua assinatura'
                                    ])
                                ] : subscription.status === 'canceling' ?
                                m(".u-radius.fontsize-smaller.u-marginbottom-10.fontweight-semibold.card-error",
                                    m("div", [
                                        m("span.fa.fa-exclamation-triangle",
                                            " "
                                        ),
                                        ` Sua assinatura será cancelada no dia ${h.momentify( subscription.next_charge_at, 'DD/MM/YYYY' )}. Até lá, ela ainda será considerada ativa.`
                                    ])
                                ) : (subscription.status === 'active' ? [
                                    subscription.payment_status !== 'pending' ? m('a.btn.btn-terciary.u-marginbottom-20.btn-inline.w-button', 
                                        {href: `/projects/${subscription.project_external_id}/subscriptions/start?${subscription.reward_external_id ? 'reward_id=' + subscription.reward_external_id : ''}&subscription_id=${subscription.id}&subscription_status=${subscription.status}`},
                                        'Editar assinatura'
                                    ) : '',
                                    subscription.payment_status === 'pending'
                                    && subscription.boleto_url
                                    && subscription.boleto_expiration_date ?
                                        [
                                            moment(subscription.boleto_expiration_date).isBefore(Date.now())
                                            ? m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                                m('span.fa.fa-exclamation-triangle'),
                                                    ` O boleto de sua assinatura venceu dia ${h.momentify(subscription.boleto_expiration_date)}` 
                                            ])
                                            : [
                                                m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                                    m('span.fa.fa-exclamation-triangle'),
                                                        ` O boleto de sua assinatura vence dia ${h.momentify(subscription.boleto_expiration_date)}` 
                                                    ]),
                                                    m(`a.btn.btn-inline.btn-small.u-marginbottom-20.w-button[target=_blank][href=${subscription.boleto_url}]`, 'Imprimir boleto')
                                            ]
                                        ] : '',
                                    m("button.btn-link.fontsize-smallest.link-hidden-light", {
                                            onclick: () => {
                                                ctrl.displayCancelModal.toggle();
                                            }
                                        },
                                        "Cancelar assinatura"
                                    )
                                ] : null)

                            ))
                    )
                ])
            ]
        ) : m('div', ''));
    }
};

export default userSubscriptionBox;
