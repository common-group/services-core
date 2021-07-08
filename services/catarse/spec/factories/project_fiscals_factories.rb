# frozen_string_literal: true

FactoryBot.define do
  factory :project_fiscal do
    association :project
    association :user
    metadata { {} }
    total_amount { Faker::Number.number(digits: 4) }
    total_catarse_fee { Faker::Number.number(digits: 4) }
    total_gateway_fee { Faker::Number.number(digits: 4) }
    total_antifraud_fee { Faker::Number.number(digits: 4) }
    total_chargeback_cost { Faker::Number.number(digits: 4) }
  end
end
