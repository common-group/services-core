# frozen_string_literal: true

module Membership
  class Subscription < ApplicationRecord
    belongs_to :project
    belongs_to :user
    belongs_to :tier, class_name: 'Membership::Tier'
    belongs_to :billing_option, class_name: 'Membership::BillingOption'

    monetize :amount_cents, numericality: { greater_than_or_equal_to: 1 }

    validates :project_id, presence: true
    validates :user_id, presence: true
    validates :tier_id, presence: true
    validates :billing_option_id, presence: true

    validates :tier_id, uniqueness: { scope: :user_id }

    validates :cadence_in_months, numericality: { equal_to: 1, only_integer: true }
  end
end
