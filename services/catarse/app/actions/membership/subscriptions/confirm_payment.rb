# frozen_string_literal: true

module Membership
  module Subscriptions
    class ConfirmPayment < Actor
      input :subscription, type: Membership::Subscription
      input :payment_item, type: Billing::PaymentItem

      def call
        ActiveRecord::Base.transaction do
          subscription.transition_to!(:active)
          subscription.update!(subscription_attributes)
        end
      end

      private

      def subscription_attributes
        next_charge_on = Time.zone.today + subscription.cadence_in_months.months
        credit_card = payment_item.payment.credit_card

        {
          payment_method: payment_item.payment.payment_method,
          next_charge_on: next_charge_on,
          credit_card: credit_card,
          shipping_address: payment_item.payment.shipping_address
        }
      end
    end
  end
end
