# frozen_string_literal: true

FactoryBot.define do
  factory :membership_subscription, class: 'Membership::Subscription' do
    traits_for_enum :state, Membership::SubscriptionStateMachine.states

    association :project, factory: :subscription_project
    association :user

    tier { association :membership_tier, project: project }
    billing_option { association :membership_billing_option, tier: tier }
    state { Membership::SubscriptionStateMachine.states.sample }
    cadence_in_months { 1 }
    amount_cents { billing_option.amount_cents }
    payment_method { Billing::PaymentMethods.list.sample }
    next_charge_on { Faker::Date.between(from: Time.zone.tomorrow, to: 10.days.from_now).to_date }

    trait :with_credit_card do
      payment_method { Billing::PaymentMethods::CREDIT_CARD }
      credit_card { association :billing_credit_card, user: user }
    end

    trait :with_shipping_address do
      association :shipping_address, factory: :common_address
    end

    trait :pending_charge do
      next_charge_on { Faker::Date.between(from: 10.days.ago, to: Time.zone.today).to_date }
    end
  end
end
