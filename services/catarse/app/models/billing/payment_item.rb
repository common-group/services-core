# frozen_string_literal: true

module Billing
  class PaymentItem < ApplicationRecord
    include Utils::HasStateMachine

    ALLOWED_PAYABLE_TYPES = %w[Contribution Membership::Subscription].freeze

    belongs_to :payment, class_name: 'Billing::Payment'
    belongs_to :payable, polymorphic: true, inverse_of: :payment_items

    scope :subscriptions, -> { where(payable_type: 'Membership::Subscription') }
    scope :contributions, -> { where(payable_type: 'Contribution') }

    monetize :amount_cents, numericality: { greater_than_or_equal_to: 1 }
    monetize :shipping_fee_cents, numericality: { greater_than_or_equal_to: 0 }
    monetize :total_amount_cents, numericality: { greater_than_or_equal_to: 1 }

    validates :payable_id, presence: true
    validates :payable_type, presence: true

    validates :payable_id, uniqueness: { scope: %i[payable_type payment_id], case_sensitive: false }
    validate :payment_user_matches_payable_user

    validates :payable_type, inclusion: { in: ALLOWED_PAYABLE_TYPES }

    delegate :settle!, :cancel!, :refund!, :chargeback!, to: :state_machine

    def subscription?
      payable_type == 'Membership::Subscription'
    end

    def contribution?
      payable_type == 'Contribution'
    end

    private

    def payment_user_matches_payable_user
      return if payment.blank? || payable.blank? || payment.user_id == payable.user_id

      errors.add(:payable, I18n.t('models.billing.payment_item.errors.invalid_user'))
    end
  end
end
