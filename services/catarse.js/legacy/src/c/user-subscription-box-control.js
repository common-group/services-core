import m from 'mithril';
import UserSubscriptionBoxControlMessage from './user-subscription-box-control-message';
import UserSubscriptionBoxControlInteraction from './user-subscription-box-control-interaction';

const UserSubscriptionBoxControl = {
    oninit: function(vnode) {

    },
    view: function({state, attrs}) {

        const subscription = attrs.subscription;

        return m('.u-marginbottom-10.u-text-center.w-col.w-col-3', [
            // Message,
            m(UserSubscriptionBoxControlMessage, {subscription}),
            // Interaction,
            m(UserSubscriptionBoxControlInteraction, {subscription})
            // Cancel
        ]);

        return m(
            '.u-marginbottom-10.u-text-center.w-col.w-col-3',
            subscription.status === 'started' 
                ? subscription.last_payment_data.status === 'refused' && subscription.payment_method != 'boleto'
                    ? 
                        [
                          m(
                              '.card-alert.u-radius.fontsize-smaller.u-marginbottom-10.fontweight-semibold',
                              m('div', [
                                  m('span.fa.fa-exclamation-triangle', '.'),
                                  `Seu pagamento foi recusado em ${h.momentify(
                                      subscription.last_payment_data.refused_at
                                  )}. Vamos tentar uma nova cobrança em ${h.momentify(subscription.last_payment_data.next_retry_at)}`,
                              ])
                          ),
                          m(
                              `a.btn.btn-inline.btn-small.w-button[href='/projects/${
                                  subscription.project_external_id
                              }/subscriptions/start?subscription_id=${subscription.id}${
                                  subscription.reward_external_id ? `&reward_id=${subscription.reward_external_id}` : ''
                              }&subscription_status=inactive']`,
                              'Refazer pagamento'
                          ),
                        ]
                    : 
                    
                    subscription.payment_status === 'pending' && subscription.boleto_url && subscription.boleto_expiration_date
                    ? [
                          moment(subscription.boleto_expiration_date)
                              .add(1, 'days')
                              .endOf('day')
                              .isBefore(Date.now())
                              ? [
                                    m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                        m('span.fa.fa-exclamation-triangle'),
                                        ` O boleto de sua assinatura venceu dia ${h.momentify(subscription.boleto_expiration_date)}`,
                                    ]),
                                    state.isGeneratingSecondSlip()
                                        ? h.loader()
                                        : m(
                                              'button.btn.btn-inline.btn-small.u-marginbottom-20.w-button',
                                              {
                                                  disabled: state.isGeneratingSecondSlip(),
                                                  onclick: state.generateSecondSlip,
                                              },
                                              'Gerar segunda via'
                                          ),
                                ]
                              : [
                                    m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                        m('span.fa.fa-exclamation-triangle'),
                                        ` O boleto de sua assinatura vence dia ${h.momentify(subscription.boleto_expiration_date)}`,
                                    ]),
                                    m(
                                        `a.btn.btn-inline.btn-small.u-marginbottom-20.w-button[target=_blank][href=${
                                            subscription.boleto_url
                                        }]`,
                                        'Imprimir boleto'
                                    ),
                                ],
                      ]
                    : subscription.payment_status === 'pending' && subscription.payment_method != 'boleto'
                    ? [
                          m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                              m('span.fa.fa-exclamation-triangle'),
                              m.trust('&nbsp;'),
                              'Aguardando confirmação do pagamento',
                          ]),
                      ]
                    : ''
                : subscription.status === 'inactive'
                ? [
                      subscription.payment_status === 'pending' && subscription.boleto_url && subscription.boleto_expiration_date
                          ? [
                                m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                    m('span.fa.fa-exclamation-triangle'),
                                    ` O boleto de sua assinatura vence dia ${h.momentify(subscription.boleto_expiration_date)}`,
                                ]),
                                m(`a.btn.btn-inline.btn-small.w-button[target=_blank][href=${subscription.boleto_url}]`, 'Imprimir boleto'),
                            ]
                          : [
                                m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                    m('span.fa.fa-exclamation-triangle'),
                                    m.trust('&nbsp;'),
                                    'Sua assinatura está inativa por falta de pagamento',
                                ]),
                                m(
                                    `a.btn.btn-inline.btn-small.w-button[target=_blank][href=/projects/${
                                        subscription.project_external_id
                                    }/subscriptions/start?subscription_id=${subscription.id}${
                                        subscription.reward_external_id ? `&reward_id=${subscription.reward_external_id}` : ''
                                    }&subscription_status=${subscription.status}]`,
                                    'Assinar novamente'
                                ),
                            ],
                  ]
                : subscription.status === 'canceled' && subscription.project.state == 'online'
                ? [
                      m(
                          'a.btn.btn-terciary.u-marginbottom-20.btn-inline.w-button',
                          {
                              href: `/projects/${subscription.project_external_id}/subscriptions/start?subscription_id=${subscription.id}${
                                  subscription.reward_external_id ? `&reward_id=${subscription.reward_external_id}` : ''
                              }&subscription_status=${subscription.status}`,
                          },
                          'Reativar assinatura'
                      ),
                      m('.card-error.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                          m('span.fa.fa-exclamation-triangle'),
                          m.trust('&nbsp;'),
                          ' Você cancelou sua assinatura',
                      ]),
                  ]
                : subscription.status === 'canceling'
                ? m(
                      '.u-radius.fontsize-smaller.u-marginbottom-10.fontweight-semibold.card-error',
                      m('div', [
                          m('span.fa.fa-exclamation-triangle', ' '),
                          ` Sua assinatura será cancelada no dia ${h.momentify(
                              subscription.next_charge_at,
                              'DD/MM/YYYY'
                          )}. Até lá, ela ainda será considerada ativa.`,
                      ])
                  )
                : subscription.status === 'active'
                ? subscription.last_payment_data.status == 'refused'
                    ? [
                          m(
                              '.card-alert.u-radius.fontsize-smaller.u-marginbottom-10.fontweight-semibold',
                              m('div', [
                                  m('span.fa.fa-exclamation-triangle', '.'),
                                  `Seu pagamento foi recusado em ${h.momentify(
                                      subscription.last_payment_data.refused_at
                                  )}. Vamos tentar uma nova cobrança em ${h.momentify(subscription.last_payment_data.next_retry_at)}`,
                              ])
                          ),
                          m(
                              `a.btn.btn-inline.btn-small.w-button[href='/projects/${
                                  subscription.project_external_id
                              }/subscriptions/start?subscription_id=${subscription.id}${
                                  subscription.reward_external_id ? `&reward_id=${subscription.reward_external_id}` : ''
                              }&subscription_status=inactive']`,
                              'Refazer pagamento'
                          ),
                      ]
                    : [
                          state.showLastSubscriptionVersionEditionNextCharge(),

                          subscription.payment_status !== 'pending'
                              ? m(
                                    'a.btn.btn-terciary.u-marginbottom-20.btn-inline.w-button',
                                    {
                                        href: `/projects/${subscription.project_external_id}/subscriptions/start?${
                                            subscription.reward_external_id ? `reward_id=${subscription.reward_external_id}` : ''
                                        }&subscription_id=${subscription.id}&subscription_status=${subscription.status}`,
                                    },
                                    'Editar assinatura'
                                )
                              : '',
                          subscription.payment_status === 'pending' && !!subscription.boleto_url && !!subscription.boleto_expiration_date
                              ? [
                                    moment(subscription.boleto_expiration_date)
                                        .add(1, 'days')
                                        .endOf('day')
                                        .isBefore(Date.now())
                                        ? [
                                              m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                                  m('span.fa.fa-exclamation-triangle'),
                                                  ` O boleto de sua assinatura venceu dia ${h.momentify(
                                                      subscription.boleto_expiration_date
                                                  )}`,
                                              ]),
                                              state.isGeneratingSecondSlip()
                                                  ? h.loader()
                                                  : m(
                                                        'button.btn.btn-inline.btn-small.u-marginbottom-20.w-button',
                                                        {
                                                            disabled: state.isGeneratingSecondSlip(),
                                                            onclick: state.generateSecondSlip,
                                                        },
                                                        'Gerar segunda via'
                                                    ),
                                          ]
                                        : [
                                              m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
                                                  m('span.fa.fa-exclamation-triangle'),
                                                  ` O boleto de sua assinatura vence dia ${h.momentify(subscription.boleto_expiration_date)}`,
                                              ]),
                                              m(
                                                  `a.btn.btn-inline.btn-small.u-marginbottom-20.w-button[target=_blank][href=${
                                                      subscription.boleto_url
                                                  }]`,
                                                  'Imprimir boleto'
                                              ),
                                          ],
                                ]
                              : '',
                          m(
                              'button.btn-link.fontsize-smallest.link-hidden-light',
                              {
                                  onclick: () => {
                                      state.displayCancelModal.toggle();
                                  },
                              },
                              'Cancelar assinatura'
                          ),
                      ]
                : null
        )
    }
};


export default UserSubscriptionBoxControl;