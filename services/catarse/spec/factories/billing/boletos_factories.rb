# frozen_string_literal: true

FactoryBot.define do
  factory :billing_boleto, class: 'Billing::Boleto' do
    association :payment, factory: :boleto_payment
    barcode { Faker::Barcode.isbn }
    url { Faker::Internet.url }
    expires_on { Faker::Date.between(from: Time.zone.tomorrow, to: 10.days.from_now).to_date }
  end
end
