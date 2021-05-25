# frozen_string_literal: true

module Billing
  class Payment < ApplicationRecord
    include Utils::HasStateMachine

    belongs_to :user

    belongs_to :billing_address, class_name: 'Shared::Address'
    belongs_to :shipping_address, class_name: 'Shared::Address', optional: true
    belongs_to :credit_card, class_name: 'Billing::CreditCard', optional: true

    has_one :boleto, class_name: 'Billing::Boleto', dependent: :destroy
    has_one :pix, class_name: 'Billing::Pix', dependent: :destroy

    has_many :items, class_name: 'Billing::PaymentItem', dependent: :destroy
    has_many :processing_fees, class_name: 'Billing::ProcessingFee', dependent: :destroy
    has_many :gateway_payables, class_name: 'Billing::GatewayPayable', dependent: :destroy

    monetize :amount_cents, numericality: { greater_than_or_equal_to: 1 }
    monetize :shipping_fee_cents, numericality: { greater_than_or_equal_to: 0 }
    monetize :payment_method_fee_cents, numericality: { greater_than_or_equal_to: 0 }
    monetize :total_amount_cents, numericality: { greater_than_or_equal_to: 1 }

    has_enumeration_for :payment_method, with: Billing::PaymentMethods, required: true, create_helpers: true
    has_enumeration_for :gateway, with: Billing::Gateways, required: true, create_helpers: true

    validates :user_id, presence: true
    validates :billing_address_id, presence: true
    validates :gateway, presence: true

    validates :gateway_id, uniqueness: { scope: :gateway }, allow_nil: true

    validates :installments_count, numericality: { greater_than: 0 }, if: :credit_card?
    validates :installments_count, numericality: { equal_to: 1 }, unless: :credit_card?

    validate :total_amount_represents_the_sum_of_amount_and_fees

    delegate :wait_payment!, :authorize!, :settle!, :refuse!, :approve_on_antifraud!, :decline_on_antifraud!,
      :wait_review!, :refund!, :chargeback!, to: :state_machine

    def lump_sum?
      installments_count == 1
    end

    def installment?
      installments_count > 1
    end

    private

    def total_amount_represents_the_sum_of_amount_and_fees
      return if total_amount_cents == (amount_cents + shipping_fee_cents + payment_method_fee_cents)

      errors.add(:total_amount_cents, I18n.t('models.billing.payment.errors.invalid_total_amount'))
    end
  end
end
