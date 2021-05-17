# frozen_string_literal: true

module Billing
  class PaymentItemBuilder
    attr_reader :attributes, :payment_item

    class << self
      delegate :build, to: :new
    end

    def initialize(attributes)
      @attributes = attributes
      @payment_item = Billing::PaymentItem.new
    end

    def build
      payment_item.assign_attributes(base_attributes)
      payment_item
    end

    private

    def base_attributes
      payable = payable_class.find(attributes[:id])
      amount_cents = (payable.value * 100).to_i
      shipping_fee_cents = (payable.shipping_fee.try(:value).to_f * 100).to_i
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
