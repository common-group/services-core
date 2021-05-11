# frozen_string_literal: true

module Billing
  class ProcessingFee < ApplicationRecord
    belongs_to :payment, class_name: 'Billing::Payment'

    monetize :amount_cents, numericality: { greater_than_or_equal_to: 1 }

    has_enumeration_for :vendor, with: Billing::ProcessingFeeVendors, required: true, create_helpers: true

    validates :payment_id, presence: true
  end
end
