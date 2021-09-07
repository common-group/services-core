# frozen_string_literal: true

module Membership
  class Subscription < ApplicationRecord
    include Utils::HasStateMachine

    belongs_to :project
    belongs_to :user
    belongs_to :tier, class_name: 'Membership::Tier'
    belongs_to :billing_option, class_name: 'Membership::BillingOption'
    belongs_to :credit_card, class_name: 'Billing::CreditCard', optional: true
    belongs_to :shipping_address, class_name: 'Shared::Address', optional: true

    has_many :payment_items, as: :payable, class_name: 'Billing::PaymentItem', dependent: :restrict_with_error

    monetize :amount_cents

    has_enumeration_for :payment_method, with: Billing::PaymentMethods, required: false, create_helpers: true

    scope :pending_charge, Membership::Subscriptions::PendingChargeQuery

    validates :project_id, presence: true
    validates :user_id, presence: true
    validates :tier_id, presence: true
    validates :billing_option_id, presence: true

    validates :user_id, uniqueness: { scope: :project_id }

    validates :cadence_in_months, numericality: { equal_to: 1, only_integer: true }
    validates :amount_cents,
      numericality: { greater_than_or_equal_to: ->(sub) { sub.billing_option&.amount_cents.to_i } }
  end
end
