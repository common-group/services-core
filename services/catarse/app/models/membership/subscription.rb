# frozen_string_literal: true

module Membership
  class Subscription < ApplicationRecord
    include Utils::HasStateMachine

    belongs_to :project
    belongs_to :user
    belongs_to :tier, class_name: 'Membership::Tier'
    belongs_to :billing_option, class_name: 'Membership::BillingOption'

    monetize :amount_cents

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
