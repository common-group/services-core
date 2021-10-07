# frozen_string_literal: true

FactoryBot.define do
  factory :billing_payment, class: 'Billing::Payment' do
    association :user, strategy: :create

    gateway { Billing::Gateways.list.sample }
    gateway_id { Faker::Internet.uuid }
    installments_count { 1 }

    traits_for_enum :state, Billing::PaymentStateMachine.states
    state { Billing::PaymentStateMachine.states.sample }

    transient do
      item_state { BillingFactoriesHelpers.convert_payment_state_to_item_state(state) }
    end

    trait :credit_card do
      payment_method { Billing::PaymentMethods::CREDIT_CARD }
      credit_card { association :billing_credit_card, user: user }
      payment_method_fee_cents { 0 }
    end

    trait :pix do
      payment_method { Billing::PaymentMethods::PIX }
      payment_method_fee_cents { 0 }
      after(:create) { |payment| create(:billing_pix, payment: payment) }
    end

    trait :boleto do
      payment_method { Billing::PaymentMethods::BOLETO }
      payment_method_fee_cents { Faker::Number.number(digits: 3) }
      after(:create) { |payment| create(:billing_boleto, payment: payment) }
    end

    trait :contribution do
      transient do
        payables do
          [create(:contribution, user: user)]
        end
      end

      after :build do |payment, evaluator|
        payment.items = evaluator.payables.map { |p| Billing::PaymentItemBuilder.build(id: p.id, type: p.class.name) }
        payment.items.each { |i| i.state = evaluator.item_state }
        payment.amount_cents = payment.items.sum(&:amount_cents)
        payment.shipping_fee_cents = payment.items.sum(&:shipping_fee_cents)
        payment.total_amount_cents = payment.items.sum(&:total_amount_cents) + payment.payment_method_fee_cents
      end
    end

    trait :subscription do
      transient do
        payables do
          sub_state = BillingFactoriesHelpers.convert_item_state_to_subscription_state(item_state)
          [create(:membership_subscription, sub_state, user: user)]
        end
      end

      after :build do |payment, evaluator|
        payment.items = evaluator.payables.map { |p| Billing::PaymentItemBuilder.build(id: p.id, type: p.class.name) }
        payment.items.each { |i| i.state = evaluator.item_state }
        payment.amount_cents = payment.items.sum(&:amount_cents)
        payment.shipping_fee_cents = payment.items.sum(&:shipping_fee_cents)
        payment.total_amount_cents = payment.items.sum(&:total_amount_cents) + payment.payment_method_fee_cents
      end
    end

    after :create do |payment|
      payment.items.each(&:save!)
    end

    factory :simple_payment, traits: %i[credit_card contribution]
    factory :credit_card_payment, traits: %i[credit_card contribution]
    factory :pix_payment, traits: %i[pix contribution]
    factory :boleto_payment, traits: %i[boleto contribution]
  end
end
