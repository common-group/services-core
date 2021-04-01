# frozen_string_literal: true

module Billing
  module Payments
    class Create < Actor
      input :user, type: User
      input :attributes, type: Hash

      output :payment, type: Billing::Payment

      def call
        ActiveRecord::Base.transaction do
          payment_items = build_payment_items
          payment_attributes = build_payment_attributes(payment_items: payment_items)
          self.payment = Billing::Payment.create!(payment_attributes)
          payment.items.create!(payment_items.map(&:attributes))
        end
      end

      private

      def build_payment_items
        # TODO: validate empty payables
        attributes[:payables].map do |payable_attributes|
          payment_item_attributes = build_payment_item_attributes(payable_attributes)
          Billing::PaymentItem.new(payment_item_attributes)
        end
      end

      def build_payment_attributes(payment_items:)
        initial_state = Billing::PaymentStateMachine.initial_state
        total_amount_cents = payment_items.sum(&:total_amount_cents)

        attributes.except(:payables).merge(
          user_id: user.id,
          state: initial_state,
          total_amount_cents: total_amount_cents
        )
      end

      def build_payment_item_attributes(payable_attributes)
        payable = payable_attributes[:type].constantize.find(payable_attributes[:id])
        amount_cents = (payable.value * 100).to_i
        shipping_fee_cents = (payable.shipping_fee.try(:value).to_f * 100).to_i
        {
          payable: payable,
          amount_cents: amount_cents,
          shipping_fee_cents: shipping_fee_cents,
          total_amount_cents: amount_cents + shipping_fee_cents,
          state: Billing::PaymentItemStateMachine.initial_state
        }
      end
    end
  end
end
