# frozen_string_literal: true

FactoryBot.define do
  factory :billing_payment, class: 'Billing::Payment' do
    association :user
    association :billing_address, factory: :shared_address

    traits_for_enum :payment_method, Billing::PaymentMethods.list
    payment_method { Billing::PaymentMethods.list.sample }

    gateway { Billing::Gateways.list.sample }

    traits_for_enum :state, Billing::PaymentStateMachine.states
    state { Billing::PaymentStateMachine.states.sample }

    gateway_id { Faker::Internet.uuid }

    credit_card_hash { Faker::Crypto.sha1 if credit_card? }
    payment_method_fee_cents { Faker::Number.number(digits: 3) }
    installments_count do
      if payment_method == Billing::PaymentMethods::CREDIT_CARD
        (1..6).to_a.sample
      else
        1
      end
    end

    trait :with_shipping_address do
      association :shipping_address, factory: :shared_address
    end

    trait :with_credit_card do
      payment_method { Billing::PaymentMethods::CREDIT_CARD }
      credit_card { association :billing_credit_card, user: user }
    end

    trait :with_boleto do
      payment_method { Billing::PaymentMethods::BOLETO }
      boleto { association :billing_boleto }
    end

    trait :with_pix do
      payment_method { Billing::PaymentMethods::PIX }
      pix { association :billing_pix }
    end

    transient do
      payment_items do
        build_list(:billing_payment_item, 2, payment: instance)
      end
    end

    after :build do |payment, evaluator|
      payment_items = evaluator.payment_items
      item_state = Billing::PaymentStateMachine::MAP_TO_PAYMENT_ITEM_STATE[payment.state]
      payment_items.each { |i| i.state = item_state }
      payment.amount_cents = payment_items.sum(&:amount_cents)
      payment.shipping_fee_cents = payment_items.sum(&:shipping_fee_cents)
      payment.total_amount_cents = payment_items.sum(&:total_amount_cents) + payment.payment_method_fee_cents
    end

    after :create do |payment, evaluator|
      payment.items.create!(evaluator.payment_items.map(&:attributes))
    end
  end
end
