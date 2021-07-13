# frozen_string_literal: true

FactoryBot.define do
  factory :membership_billing_option, class: 'Membership::BillingOption' do
    association :tier
    cadence_in_months { 1 }
    amount { Faker::Number.number(digits: 4) }
    enabled { Faker::Boolean.boolean }
  end
end
