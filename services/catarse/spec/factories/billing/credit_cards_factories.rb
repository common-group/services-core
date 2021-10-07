# frozen_string_literal: true

FactoryBot.define do
  factory :billing_credit_card, class: 'Billing::CreditCard' do
    association :user, factory: :user, strategy: :create
    association :billing_address, factory: :common_address, strategy: :create

    gateway { Billing::Gateways.list.sample }
    gateway_id { Faker::Internet.uuid }
    holder_name { Faker::Name.name }
    bin { Faker::Business.credit_card_number.tr('-', '')[0..5] }
    last_digits { Faker::Business.credit_card_number[-4..] }
    country { Faker::Address.country.upcase }
    brand { Faker::Business.credit_card_type }
    expires_on { Faker::Business.credit_card_expiry_date }
    saved { Faker::Boolean.boolean }
  end
end
