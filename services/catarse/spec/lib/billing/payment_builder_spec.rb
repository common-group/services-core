# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::PaymentBuilder, type: :lib do
  describe '#build' do
    subject(:payment) { described_class.new(attributes).build }

    let(:base_attributes) do
      attributes_for(:billing_payment).slice(:payment_method, :gateway, :installments_count, :credit_card_id)
    end

    let!(:attributes) do
      base_attributes.merge(
        payables: [{ type: 'Contribution', id: '1' }, { type: 'Subscription', id: '2' }],
        billing_address_id: create(:shared_address).id
      )
    end
    let(:item_a) { Billing::PaymentItem.new(amount: 20, shipping_fee: 30, total_amount: 50) }
    let(:item_b) { Billing::PaymentItem.new(amount: 50, shipping_fee: 20, total_amount: 70) }

    before do
      allow(Billing::PaymentItemBuilder).to receive(:build)
        .with(type: 'Contribution', id: '1').and_return(item_a)
      allow(Billing::PaymentItemBuilder).to receive(:build)
        .with(type: 'Subscription', id: '2').and_return(item_b)
    end

    it 'assigns base attributes' do
      expect(payment.attributes).to include(base_attributes.stringify_keys)
    end

    it 'assigns initial state' do
      expect(payment.state).to eq Billing::PaymentStateMachine.initial_state
    end

    it 'assigns billing address replica' do
      replica = instance_double(Shared::Address, id: Faker::Internet.uuid)
      allow(Shared::AddressReplicator).to receive(:by_id).with(attributes[:billing_address_id]).and_return(replica)

      expect(payment.billing_address_id).to eq replica.id
    end

    context 'when shipping address id is present' do
      before { attributes.merge!(shipping_address_id: create(:shared_address).id) }

      it 'assigns shipping address replica' do
        replica = instance_double(Shared::Address, id: Faker::Internet.uuid)

        allow(Shared::AddressReplicator).to receive(:by_id).with(attributes[:billing_address_id]).and_call_original
        allow(Shared::AddressReplicator).to receive(:by_id).with(attributes[:shipping_address_id]).and_return(replica)

        expect(payment.shipping_address_id).to eq replica.id
      end
    end

    context 'when shipping address id isn`t present' do
      before { attributes.merge!(shipping_address_id: nil) }

      it 'assigns nil to payment shipping address' do
        expect(payment.shipping_address_id).to be_nil
      end
    end

    it 'builds and assigns payment items using payable attributes' do
      expect(payment.items).to eq [item_a, item_b]
    end

    context 'when payment method is boleto' do
      before { attributes[:payment_method] = Billing::PaymentMethods::BOLETO }

      it 'assigns R$ 2,00 to payment method fee' do
        expect(payment.payment_method_fee_cents).to eq 200
      end
    end

    context 'when payment method is pix' do
      before { attributes[:payment_method] = Billing::PaymentMethods::PIX }

      it 'assigns R$ 0,00 to payment method fee' do
        expect(payment.payment_method_fee_cents).to eq 0
      end
    end

    context 'when payment method is credit card and is a lump sum payment' do
      before { attributes.merge!(installments_count: 1, payment_method: Billing::PaymentMethods::CREDIT_CARD) }

      it 'assigns R$ 0,00 to payment method fee' do
        expect(payment.payment_method_fee_cents).to eq 0
      end
    end

    context 'when payment method is credit card and is an installment' do
      before { attributes.merge!(installments_count: 4, payment_method: Billing::PaymentMethods::CREDIT_CARD) }

      it 'assigns interest fee to payment method fee' do
        interest_fee = Billing::InstallmentCalculator.calculate_interest_amount(
          amount: payment.amount_cents + payment.shipping_fee_cents, installments_count: payment.installments_count
        )
        expect(payment.payment_method_fee_cents).to eq interest_fee
      end
    end

    it 'sums items amount and assigns to amount' do
      expect(payment.amount).to eq item_a.amount + item_b.amount
    end

    it 'sums items shipping fee and assigns to shipping_fee' do
      expect(payment.shipping_fee).to eq item_a.shipping_fee + item_b.shipping_fee
    end

    it 'sums items total amount + payment method fee and assigns to total amount' do
      expect(payment.total_amount).to eq item_a.total_amount + item_b.total_amount + payment.payment_method_fee
    end
  end
end
