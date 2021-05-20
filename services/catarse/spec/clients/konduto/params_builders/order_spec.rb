# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Konduto::ParamsBuilders::Order, type: :params_builder do
  subject(:params_builder) { described_class.new(payment: payment) }

  let(:payment) { Billing::Payment.new(payment_attributes) }

  describe 'ATTRIBUTES constant' do
    it 'returns params attributes' do
      expect(described_class::ATTRIBUTES).to eq %i[
        id
        visitor
        total_amount
        shipping_amount
        currency
        installments
        ip
        purchased_at
        analyze
        customer
        payment
        billing
        shipping
        shopping_cart
      ]
    end
  end

  describe '#build' do
    let(:payment) { create(:billing_payment, :credit_card, credit_card: build(:billing_credit_card)) }

    it 'returns all attributes with corresponding methods results' do
      expect(params_builder.build).to eq(
        id: params_builder.id,
        visitor: params_builder.visitor,
        total_amount: params_builder.total_amount,
        shipping_amount: params_builder.shipping_amount,
        currency: params_builder.currency,
        installments: params_builder.installments,
        ip: params_builder.ip,
        purchased_at: params_builder.purchased_at,
        analyze: params_builder.analyze,
        customer: params_builder.customer,
        payment: params_builder.payment,
        billing: params_builder.billing,
        shipping: params_builder.shipping,
        shopping_cart: params_builder.shopping_cart
      )
    end
  end

  describe '#id' do
    let(:payment_attributes) { { id: Faker::Internet.uuid } }

    it 'returns payment id as string' do
      expect(params_builder.id).to eq payment.id.to_s
    end
  end

  describe '#visitor' do
    let(:user) { User.new(id: Faker::Internet.uuid) }
    let(:payment_attributes) { { user: user } }

    it 'returns current user id' do
      expect(params_builder.visitor).to eq user.id.to_s
    end
  end

  describe '#total_amount' do
    let(:payment_attributes) { { total_amount_cents: Faker::Number.number(digits: 4) } }

    it 'returns payment total amount as float' do
      expect(params_builder.total_amount).to eq payment.total_amount.to_f
    end
  end

  describe '#shipping_amount' do
    let(:payment_attributes) { { shipping_fee_cents: Faker::Number.number(digits: 4) } }

    it 'returns payment shipping fee as float' do
      expect(params_builder.shipping_amount).to eq payment.shipping_fee.to_f
    end
  end

  describe '#currency' do
    let(:payment_attributes) { { total_amount_currency: Faker::Currency.code } }

    it 'returns total amount currency' do
      expect(params_builder.currency).to eq payment.total_amount_currency
    end
  end

  describe '#installments' do
    let(:payment_attributes) { { installments_count: (1..6).to_a.sample } }

    it 'returns payment installments count' do
      expect(params_builder.installments).to eq payment.installments_count
    end
  end

  describe '#ip' do
    let(:user) { User.new(current_sign_in_ip: Faker::Internet.public_ip_v4_address) }
    let(:payment_attributes) { { user: user } }

    it 'returns payer current sign in ip' do
      expect(params_builder.ip).to eq user.current_sign_in_ip
    end
  end

  describe '#purchased_at' do
    let(:payment_attributes) { { created_at: Faker::Time.backward(days: 30) } }

    it 'returns payment creation date using iso8601 format' do
      expect(params_builder.purchased_at).to eq payment.created_at.iso8601
    end
  end

  describe '#analyze' do
    let(:payment_attributes) { {} }

    context 'when payment is authorized' do
      before { allow(payment).to receive(:in_state?).with(:authorized).and_return(true) }

      it 'returns true' do
        expect(params_builder.analyze).to be true
      end
    end

    context 'when payment isn`t authorized' do
      before { allow(payment).to receive(:in_state?).with(:authorized).and_return(false) }

      it 'returns false' do
        expect(params_builder.analyze).to be false
      end
    end
  end

  describe '#customer' do
    let(:user) { build(:user, created_at: Faker::Time.backward(days: 30)) }
    let(:payment_attributes) { { user: user } }
    let(:customer_params) { Konduto::ParamsBuilders::Customer.new(user).build }

    it 'returns customer params' do
      expect(params_builder.customer).to eq customer_params
    end
  end

  describe '#payment' do
    let(:payment_attributes) { { credit_card: build(:billing_credit_card) } }
    let(:payment_params) { Konduto::ParamsBuilders::Payment.new(payment).build }

    it 'returns payment params as array element' do
      expect(params_builder.payment).to eq [payment_params]
    end
  end

  describe '#billing' do
    let(:payment_attributes) { { billing_address: billing_address, credit_card: credit_card } }
    let(:billing_address) { build(:shared_address) }
    let(:credit_card) { build(:billing_credit_card) }
    let(:billing_address_params) { Konduto::ParamsBuilders::Address.new(billing_address, credit_card).build }

    it 'returns billing address params' do
      expect(params_builder.billing).to eq billing_address_params
    end
  end

  describe '#shipping' do
    context 'when payment has shipping address' do
      let(:payment_attributes) { { shipping_address: shipping_address, credit_card: credit_card } }
      let(:shipping_address) { build(:shared_address) }
      let(:credit_card) { build(:billing_credit_card) }
      let(:shipping_address_params) { Konduto::ParamsBuilders::Address.new(shipping_address, credit_card).build }

      it 'returns shipping address params' do
        expect(params_builder.shipping).to eq shipping_address_params
      end
    end

    context 'when payment hasn`t shipping_address' do
      let(:payment_attributes) { { shipping_address: nil } }

      it 'returns nil' do
        expect(params_builder.shipping).to be_nil
      end
    end
  end

  describe '#shopping_cart' do
    let(:payment_attributes) { { items: payment_items } }
    let(:payment_items) { build_list(:billing_payment_item, 2) }
    let(:shopping_cart_item_params) do
      payment_items.map { |item| Konduto::ParamsBuilders::ShoppingCartItem.new(item).build }
    end

    it 'returns shopping cart item params for each payment item' do
      expect(params_builder.shopping_cart).to eq shopping_cart_item_params
    end
  end
end
