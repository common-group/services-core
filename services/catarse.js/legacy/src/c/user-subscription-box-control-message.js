import m from 'mithril'
import moment from 'moment'

const UserSubscriptionBoxControlMessage = {
  oninit: function (vnode) {

  },
  view: function ({ state, attrs }) {
    const subscription = attrs.subscription
    const subscriptionStartedOrActive = subscription.status === 'started' || subscription.status === 'active'
    const isPaymentRefusedOnStartedOrActive = subscriptionStartedOrActive && subscription.last_payment_data.status === 'refused' && subscription.payment_method != 'boleto'
    const isPendingPaymentFromSlip = subscription.payment_status === 'pending' && !!subscription.boleto_url && !!subscription.boleto_expiration_date

    const isExpirationDateBeforeToday = moment(subscription.boleto_expiration_date).add(1, 'days').endOf('day').isBefore(Date.now())
    const isPaymentSlipBeforeExpiring = isPendingPaymentFromSlip && !isExpirationDateBeforeToday
    const isPaymentSlipExpired = subscriptionStartedOrActive && isPendingPaymentFromSlip && isExpirationDateBeforeToday
    const subscriptionNotPaid = subscription.status === 'inactive' && subscription.payment_status === 'pending'

    if (isPaymentRefusedOnStartedOrActive) {
      return m('.card-alert.u-radius.fontsize-smaller.u-marginbottom-10.fontweight-semibold',
        m('div', [
          m('span.fa.fa-exclamation-triangle', '.'),
                    `Seu pagamento foi recusado em ${h.momentify(subscription.last_payment_data.refused_at)}. Vamos tentar uma nova cobrança em ${h.momentify(subscription.last_payment_data.next_retry_at)}`
        ])
      )
    } else if (isPaymentSlipBeforeExpiring) {
      return m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
        m('span.fa.fa-exclamation-triangle'),
                ` O boleto de sua assinatura vence dia ${h.momentify(subscription.boleto_expiration_date)}`
      ])
    } else if (isPaymentSlipExpired) {
      return m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
        m('span.fa.fa-exclamation-triangle'),
                ` O boleto de sua assinatura venceu dia ${h.momentify(subscription.boleto_expiration_date)}`
      ])
    } else if (subscriptionNotPaid) {
      return m('.card-alert.fontsize-smaller.fontweight-semibold.u-marginbottom-10.u-radius', [
        m('span.fa.fa-exclamation-triangle'),
        m.trust('&nbsp;'),
        'Sua assinatura está inativa por falta de pagamento'
      ])
    } else {
      return m('span')
    }
  }
}

export default UserSubscriptionBoxControlMessage
