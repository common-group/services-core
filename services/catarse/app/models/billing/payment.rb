# frozen_string_literal: true

module Billing
  class Payment < ApplicationRecord
    include Utils::HasStateMachine

    belongs_to :user

    belongs_to :billing_address, class_name: 'Shared::Address'
    belongs_to :shipping_address, class_name: 'Shared::Address', optional: true

    has_one :credit_card, class_name: 'Billing::CreditCard', dependent: :destroy
    has_one :boleto, class_name: 'Billing::Boleto', dependent: :destroy
    has_one :pix, class_name: 'Billing::Pix', dependent: :destroy

    has_many :items, class_name: 'Billing::PaymentItem', dependent: :destroy
    has_many :processing_fees, class_name: 'Billing::ProcessingFee', dependent: :destroy

    monetize :amount_cents, numericality: { greater_than_or_equal_to: 1 }
    monetize :total_shipping_fee_cents, numericality: { greater_than_or_equal_to: 0 }
    monetize :total_amount_cents, numericality: { greater_than_or_equal_to: 1 }

    has_enumeration_for :payment_method, with: Billing::PaymentMethods, required: true, create_helpers: true

    validates :user_id, presence: true
    validates :billing_address_id, presence: true
    validates :gateway, presence: true

    validates :gateway_id, uniqueness: { scope: :gateway }, allow_nil: true
  end
end