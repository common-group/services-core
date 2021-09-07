# frozen_string_literal: true

FactoryBot.define do
  factory :billing_pix, class: 'Billing::Pix' do
    association :payment, factory: :pix_payment
    key { Faker::Lorem.paragraph }
    expires_on { Faker::Date.between(from: Time.zone.tomorrow, to: 10.days.from_now).to_date }
  end
end
