# frozen_string_literal: true

FactoryBot.define do
  factory :billing_payment_item, class: 'Billing::PaymentItem' do
    association :payment, factory: :billing_payment

    payable { create(%i[contribution membership_subscription].sample, user: payment.user) }

    amount_cents { Faker::Number.number(digits: 4) }
    shipping_fee_cents { Faker::Number.number(digits: 4) }
    total_amount_cents { amount_cents + shipping_fee_cents }

    state { Billing::PaymentItemStateMachine.states.sample }
    traits_for_enum :state, Billing::PaymentItemStateMachine.states

    trait :contribution do
      payable { create(:contribution, user: payment.user) }
    end

    trait :subscription do
      payable { create(:membership_subscription, user: payment.user) }
    end
  end
end
