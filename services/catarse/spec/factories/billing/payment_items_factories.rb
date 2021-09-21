# frozen_string_literal: true

FactoryBot.define do
  factory :billing_payment_item, class: 'Billing::PaymentItem' do
    traits_for_enum :state, Billing::PaymentItemStateMachine.states
    state { Billing::PaymentItemStateMachine.states.sample }

    amount_cents { Faker::Number.number(digits: 4) }
    shipping_fee_cents { Faker::Number.number(digits: 4) }
    total_amount_cents { amount_cents + shipping_fee_cents }

    transient do
      user { create(:user) }
    end

    payment do
      create(:billing_payment, :credit_card,
        amount_cents: amount_cents,
        shipping_fee_cents: shipping_fee_cents,
        total_amount_cents: total_amount_cents,
        user: user
      )
    end

    trait :contribution do
      payable { create(:contribution, user: payment.user) }
    end

    trait :subscription do
      payable do
        sub_state = BillingFactoriesHelpers.convert_item_state_to_subscription_state(state)
        create(:membership_subscription, sub_state, user: payment.user)
      end
    end
  end
end
