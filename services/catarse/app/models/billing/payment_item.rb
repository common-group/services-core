# frozen_string_literal: true

module Billing
  class PaymentItem < ApplicationRecord
    include Utils::HasStateMachine

    belongs_to :payment, class_name: 'Billing::Payment'
    belongs_to :payable, polymorphic: true

    monetize :amount_cents, numericality: { greater_than_or_equal_to: 1 }
    monetize :shipping_fee_cents, numericality: { greater_than_or_equal_to: 0 }
    monetize :total_amount_cents, numericality: { greater_than_or_equal_to: 1 }

    validates :payable_id, presence: true
    validates :payable_type, presence: true

    validates :payable_id, uniqueness: { scope: %i[payable_type payment_id] }
    validate :payment_user_matches_payable_user

    def payment_user_matches_payable_user
      return if payment.blank? || payable.blank? || payment.user_id == payable.user_id

      errors.add(:payable, I18n.t('models.billing.payment_item.errors.invalid_user'))
    end
  end
end
