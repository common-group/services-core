# frozen_string_literal: true

module Billing
  class GatewayPayable < ApplicationRecord
    belongs_to :payment, class_name: 'Billing::Payment'

    monetize :amount_cents, numericality: { greater_than_or_equal_to: 1 }
    monetize :fee_cents, numericality: { greater_than_or_equal_to: 0 }

    validates :payment_id, presence: true
    validates :gateway_id, presence: true
    validates :state, presence: true
    validates :installment_number, presence: true

    validates :gateway_id, uniqueness: { scope: :payment_id }
  end
end
