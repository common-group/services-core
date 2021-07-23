# frozen_string_literal: true

module Membership
  class BillingOptionEntity < BaseEntity
    expose :id
    expose :cadence_in_months
    expose :amount, using: MoneyEntity
    expose :enabled
  end
end
