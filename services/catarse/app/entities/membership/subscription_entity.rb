# frozen_string_literal: true

module Membership
  class SubscriptionEntity < BaseEntity
    expose :id
    expose :cadence_in_months
    expose :state
    expose :amount, using: MoneyEntity

    expose :user do
      expose(:id) { |sub| sub.user.id }
      expose(:name) { |sub| sub.user.name }
    end

    expose :project do
      expose(:id) { |sub| sub.project.id }
      expose(:name) { |sub| sub.project.name }
      expose(:permalink) { |sub| sub.project.permalink }
    end

    expose :tier do
      expose(:id) { |sub| sub.tier.id }
      expose(:name) { |sub| sub.tier.name }
    end

    expose :billing_option do
      expose(:id) { |sub| sub.billing_option.id }
    end
  end
end
