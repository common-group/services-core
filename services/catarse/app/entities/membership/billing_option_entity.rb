# frozen_string_literal: true

module Membership
  class BillingOptionEntity < BaseEntity
    expose :id
    expose :cadence_in_months
    expose :amount, with: MoneyEntity
    expose :enabled
  end
end
