# frozen_string_literal: true

FactoryBot.define do
  factory :membership_subscription, class: 'Membership::Subscription' do
    association :project
    association :user
    tier { association :membership_tier, project: project }
    billing_option { association :membership_billing_option, tier: tier }
    state { '#TODO' }
    cadence_in_months { 1 }
    amount { Faker::Number.number(digits: 4) }
  end
end
