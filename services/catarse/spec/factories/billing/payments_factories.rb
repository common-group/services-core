# frozen_string_literal: true

FactoryBot.define do
  factory :billing_payment, class: 'Billing::Payment' do
    association :user
    association :billing_address, factory: :shared_address

    payment_method { Billing::PaymentMethods.list.sample }

    state { Billing::PaymentStateMachine.states.sample }
    traits_for_enum :state, Billing::PaymentStateMachine.states

    gateway { Faker::Lorem.word }
    gateway_id { Faker::Internet.uuid }

    trait :with_shipping_address do
      association :shipping_address, factory: :shared_address
    end

    transient do
      payment_items do
        build_list(:billing_payment_item, 2, payment: nil)
      end
    end

    after :build do |payment, evaluator|
      payment.total_amount_cents = evaluator.payment_items.sum(&:total_amount_cents)
    end

    after :create do |payment, evaluator|
      payment.items.create!(evaluator.payment_items.map(&:attributes))
    end
  end
end
