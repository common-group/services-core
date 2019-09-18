import m from 'mithril'
import moment from 'moment'
import h from '../h'

const UserSubscriptionBoxControlInteraction = {
  oninit: function (vnode) {

  },
  view: function ({ state, attrs }) {
    const subscription = attrs.subscription
    const isExpirationDateBeforeToday = moment(subscription.boleto_expiration_date).add(1, 'days').endOf('day').isBefore(Date.now())

    const canRedoPayment = (subscription.status === 'started' || subscription.status === 'active') && subscription.last_payment_data.status === 'refused' && subscription.payment_method != 'boleto'
    const canPrintSlip = subscription.payment_status === 'pending' && !!subscription.boleto_url && !!subscription.boleto_expiration_date && !isExpirationDateBeforeToday
    const canGenerateSecondSlip = (subscription.payment_status === 'pending' && subscription.boleto_url && subscription.boleto_expiration_date && isExpirationDateBeforeToday)

    if (canRedoPayment) {
      return m(`a.btn.btn-inline.btn-small.w-button[href='/projects/${
                    subscription.project_external_id
                }/subscriptions/start?subscription_id=${subscription.id}${
                    subscription.reward_external_id ? `&reward_id=${subscription.reward_external_id}` : ''
                }&subscription_status=inactive']`,
      'Refazer pagamento'
      )
    } else if (canPrintSlip) {
      return m(`a.btn.btn-inline.btn-small.u-marginbottom-20.w-button[target=_blank][href=${subscription.boleto_url}]`,
        'Imprimir boleto'
      )
    } else if (canGenerateSecondSlip) {
      return state.isGeneratingSecondSlip()
        ? h.loader()
        : m('button.btn.btn-inline.btn-small.u-marginbottom-20.w-button', {
          disabled: state.isGeneratingSecondSlip(),
          onclick: state.generateSecondSlip
        }, 'Gerar segunda via')
    } else {
      return m('span')
    }
  }
}

export default UserSubscriptionBoxControlInteraction
