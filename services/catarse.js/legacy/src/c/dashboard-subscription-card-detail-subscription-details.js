import m from 'mithril';
import _ from 'underscore';
import subscriptionStatusIcon from './subscription-status-icon';
import paymentMethodIcon from './payment-method-icon';
import dashboardSubscriptionCardDetailPaymentHistory from './dashboard-subscription-card-detail-payment-history';

const dashboardSubscriptionCardDetailSubscriptionDetails = {
    controller: function(args)
    {

    },
    view: function(ctrl, args)
    {
        const subscription = args.subscription,
            reward = args.reward,
            user = args.user;
            
        return m('.u-marginbottom-20.card.u-radius', 
        [
            m('.fontsize-small.fontweight-semibold.u-marginbottom-10',
                'Detalhes da assinatura'
            ),
            m('.fontsize-smaller.u-marginbottom-20', [
                m('div', [
                    m('span.fontcolor-secondary',
                      'Status: '
                     ),
                    m(subscriptionStatusIcon, {
                        subscription
                    })
                ]),
                m('div', [
                    m('span.fontcolor-secondary',
                        'Valor da assinatura: '
                    ),
                    `R$${subscription.amount / 100}`
                ]),
                m('div', [
                    m('span.fontcolor-secondary',
                        'Recompensa: '
                    ), !_.isEmpty(reward) ? `R$${reward.minimum_value} - ${reward.title} - ${reward.description.substring(0, 90)}(...)` : 'Sem recompensa'
                ]),
                m('div', [
                    m('span.fontcolor-secondary',
                        'Meio de pagamento: '
                    ),
                    m(paymentMethodIcon, { subscription })
                ]),
                m('div', [
                    m('span.fontcolor-secondary',
                        'Qtde. de apoios confirmados: '
                    ),
                    `${subscription.paid_count} meses`
                ]),
                m('.fontsize-base.u-margintop-10', [
                    m('span.fontcolor-secondary',
                        'Total apoiado: '
                    ),
                    m.trust('&nbsp;'),
                    m('span.fontweight-semibold.text-success',
                        `R$${subscription.total_paid / 100}`
                    )
                ])
            ]),
            m(".divider.u-marginbottom-20"),
            m(dashboardSubscriptionCardDetailPaymentHistory, { user, subscription })
        ]);
    }
};

export default dashboardSubscriptionCardDetailSubscriptionDetails;
