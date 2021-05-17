# frozen_string_literal: true

FactoryBot.define do
  factory :billing_gateway_payable, class: 'Billing::GatewayPayable' do
    association :payment, factory: :billing_payment
    gateway_id { Faker::Internet.uuid }
    state { Faker::Lorem.word }
    amount { Faker::Number.number(digits: 4) }
    fee { Faker::Number.number(digits: 3) }
    installment_number { Faker::Number.number(digits: 1) }
    paid_at { Faker::Time.backward(days: 30) }
    data { Hash[*Faker::Lorem.words(number: 8)] }
  end
end
