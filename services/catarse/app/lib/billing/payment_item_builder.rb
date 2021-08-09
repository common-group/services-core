# frozen_string_literal: true

module Billing
  class PaymentItemBuilder
    attr_reader :attributes, :payment_item

    def initialize(attributes)
      @attributes = attributes
      @payment_item = Billing::PaymentItem.new
    end

    def self.build(attributes)
      new(attributes).build
    end

    def build
      payment_item.assign_attributes(base_attributes)
      payment_item
    end

    private

    def base_attributes
      payable = payable_class.find(attributes[:id])
      amount_cents = payable.amount_cents
      shipping_fee_cents = payable.try(:shipping_fee_cents).to_i
      initial_state = Billing::PaymentItemStateMachine.initial_state
      {
        payable: payable,
        amount_cents: amount_cents,
        shipping_fee_cents: shipping_fee_cents,
        total_amount_cents: amount_cents + shipping_fee_cents,
        state: initial_state
      }
    end

    def payable_class
      attributes[:type].constantize
    end
  end
end
