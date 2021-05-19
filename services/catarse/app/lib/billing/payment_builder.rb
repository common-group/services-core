# frozen_string_literal: true

module Billing
  class PaymentBuilder
    attr_reader :attributes, :payment

    def initialize(attributes)
      @attributes = attributes
      @payment = Billing::Payment.new
    end

    def build
      payment.assign_attributes(base_attributes)
      payment.items = build_payment_items
      payment.assign_attributes(monetary_attributes)
      payment
    end

    private

    def base_attributes
      replicate_addresses
      initial_state = Billing::PaymentStateMachine.initial_state
      attributes.except(:payables).merge(state: initial_state, gateway: Billing::Gateways::PAGAR_ME)
    end

    def replicate_addresses
      %i[billing_address_id shipping_address_id].each do |address_attributes|
        next if attributes[address_attributes].blank?

        address_replica = ::Shared::AddressReplicator.by_id(attributes[address_attributes])
        attributes[address_attributes] = address_replica.id
      end
    end

    def build_payment_items
      attributes[:payables].map do |payable_attributes|
        Billing::PaymentItemBuilder.build(payable_attributes)
      end
    end

    def monetary_attributes
      amount_cents = payment.items.sum(&:amount_cents)
      shipping_fee_cents = payment.items.sum(&:shipping_fee_cents)
      payment_method_fee_cents = calculate_payment_method_fee(amount_cents + shipping_fee_cents)
      total_amount_cents = payment.items.sum(&:total_amount_cents) + payment_method_fee_cents
      {
        amount_cents: amount_cents,
        shipping_fee_cents: shipping_fee_cents,
        payment_method_fee_cents: payment_method_fee_cents,
        total_amount_cents: total_amount_cents
      }
    end

    def calculate_payment_method_fee(amount)
      if payment.boleto?
        200 # TODO: Get boleto cost from settings
      elsif payment.credit_card? && payment.installment?
        Billing::InstallmentCalculator.calculate_interest_amount(
          amount: amount, installments_count: payment.installments_count
        )
      else
        0
      end
    end
  end
end
