# frozen_string_literal: true

FactoryBot.define do
  factory :billing_processing_fee, class: 'Billing::ProcessingFee' do
    association :payment, factory: :billing_payment
    amount { Faker::Number.number(digits: 3) }
    vendor { Billing::ProcessingFeeVendors.list.sample }
  end
end
