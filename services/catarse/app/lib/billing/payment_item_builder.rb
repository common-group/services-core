# frozen_string_literal: true

module Billing
  class PaymentItemBuilder
    attr_reader :attributes

    def initialize(attributes)
      @attributes = attributes
    end

    def self.build(attributes)
      new(attributes).build
    end

    def build
      payment_item = Billing::PaymentItem.new
      payment_item.assign_attributes(base_attributes)
      payment_item
    end

    private

    def base_attributes
      amount_cents = payable.amount_cents
      shipping_fee_cents = 0 # TODO: calculate shipping fee
      initial_state = Billing::PaymentItemStateMachine.initial_state
      {
        payable: payable,
        amount_cents: amount_cents,
        shipping_fee_cents: shipping_fee_cents,
        total_amount_cents: amount_cents + shipping_fee_cents,
        state: initial_state
      }
    end

    def payable
      @payable ||= begin
        payable_class = attributes[:type].constantize
        payable_class.find_by(id: attributes[:id])
      end
    end
  end
end
