# frozen_string_literal: true

module Membership
  module Subscriptions
    class Charge < Actor
      input :subscription, type: Membership::Subscription

      def call
        create_and_process_payment
      rescue StandardError => e
        Sentry.capture_exception(e, level: :fatal, extra: { subscription_id: subscription.id })
      end

      private

      def create_and_process_payment
        Billing::Payments::Process.call(
          user: subscription.user,
          attributes: {
            payment_method: subscription.payment_method,
            installments_count: 1,
            billing_address_id: 1, # TODO: use credit_card billing address
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
