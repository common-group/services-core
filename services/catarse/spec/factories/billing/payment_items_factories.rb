# frozen_string_literal: true

SUBSCRIPTION_FACTORY_STATES = {
  pending: :started,
  paid: :active,
  canceled: :canceled,
  refunded: :inactive,
  charged_back: :inactive
}.freeze

FactoryBot.define do
  factory :billing_payment_item, class: 'Billing::PaymentItem' do
    traits_for_enum :state, Billing::PaymentItemStateMachine.states

    association :payment, factory: :billing_payment

    payable do
      if Faker::Boolean.boolean # randomize payable between Contribution and Subscription
        create(:membership_subscription, SUBSCRIPTION_FACTORY_STATES[state.to_sym], user: payment.user)
      else
        create(:contribution, user: payment.user)
      end
    end

    amount_cents { Faker::Number.number(digits: 4) }
    shipping_fee_cents { Faker::Number.number(digits: 4) }
    total_amount_cents { amount_cents + shipping_fee_cents }
    state { Billing::PaymentItemStateMachine.states.sample }

    trait :contribution do
      payable { create(:contribution, user: payment.user) }
    end

    trait :subscription do
      payable do
        create(:membership_subscription, SUBSCRIPTION_FACTORY_STATES[state.to_sym], user: payment.user)
      end
    end
  end
end
