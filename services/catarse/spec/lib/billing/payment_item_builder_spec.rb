# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::PaymentItemBuilder, type: :lib do
  describe '#build' do
    subject(:payment_item) { described_class.new(attributes).build }

    let(:contribution) { create(:contribution, shipping_fee: shipping_fee) }
    let(:shipping_fee) { create(:shipping_fee) }
    let(:attributes) { { type: contribution.class.to_s, id: contribution.id } }

    it 'returns a new payment item' do
      expect(payment_item).to be_a_new(Billing::PaymentItem)
    end

    it 'finds and assigns payable object' do
      expect(payment_item.payable).to eq contribution
    end

    it 'assigns payable value as payment item amount' do
      expect(payment_item.amount.to_f).to eq contribution.value
    end

    it 'assigns payable shipping fee as payment item shipping fee' do
      expect(payment_item.shipping_fee.to_f).to eq shipping_fee.value
    end

    it 'sums amount and shipping fee and assigns to total_amount' do
      expect(payment_item.total_amount).to eq(payment_item.amount + payment_item.shipping_fee)
    end

    it 'assigns initial state' do
      expect(payment_item.state).to eq Billing::PaymentItemStateMachine.initial_state
    end
  end
end
