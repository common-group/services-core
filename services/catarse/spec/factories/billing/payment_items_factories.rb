# frozen_string_literal: true

FactoryBot.define do
  factory :billing_payment_item, class: 'Billing::PaymentItem' do
    association :payment, factory: :billing_payment
    association :payable, factory: :contribution, strategy: :create

    amount_cents { Faker::Number.number(digits: 4) }
    shipping_fee_cents { Faker::Number.number(digits: 4) }
    total_amount_cents { amount_cents + shipping_fee_cents }

    state { Billing::PaymentItemStateMachine.states.sample }
    traits_for_enum :state, Billing::PaymentItemStateMachine.states

    trait :contribution do
      association :payable, factory: :contribution
    end

    trait :subscription do
      association :payable, factory: :subscription
    end
  end
end
