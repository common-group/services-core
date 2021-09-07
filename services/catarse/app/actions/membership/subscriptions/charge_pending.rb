# frozen_string_literal: true

module Membership
  module Subscriptions
    class ChargePending < Actor
      def call
        Membership::Subscription.pending_charge.find_each do |subscription|
          charge_subscription(subscription)
        rescue StandardError => e
          Sentry.capture_exception(e, level: :fatal, extra: { subscription_id: subscription.id })
        end
      end

      private

      def charge_subscription(subscription)
        Billing::Payments::Checkout.call(
          user: subscription.user,
          attributes: {
            payment_method: subscription.payment_method,
            installments_count: 1,
            billing_address_id: Shared::Address.last.id, # TODO: use credit_card billing address
            shipping_address_id: subscription.shipping_address_id,
            credit_card_id: subscription.credit_card_id,
            payables: [
              id: subscription.id, type: subscription.class.name
            ]
          }
        )
      end
    end
  end
end
