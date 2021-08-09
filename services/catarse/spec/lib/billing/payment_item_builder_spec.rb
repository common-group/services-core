# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::PaymentItemBuilder, type: :lib do
  describe '#build' do
    subject(:payment_item) { described_class.new(attributes).build }

    %i[contribution membership_subscription].each do |factory_name|
      context "with #{factory_name} as payable" do
        let(:payable) { create(factory_name) }
        let(:attributes) { { type: payable.class.to_s, id: payable.id } }

        it 'returns a new payment item' do
          expect(payment_item).to be_a_new(Billing::PaymentItem)
        end

        it 'finds and assigns payable object' do
          expect(payment_item.payable).to eq payable
        end

        it 'assigns payable value as payment item amount' do
          expect(payment_item.amount_cents).to eq payable.amount_cents
        end

        it 'assigns payable shipping fee as payment item shipping fee' do
          expect(payment_item.shipping_fee_cents).to eq payable.try(:shipping_fee_cents).to_i
        end

        it 'sums amount and shipping fee and assigns to total_amount' do
          expect(payment_item.total_amount).to eq(payment_item.amount + payment_item.shipping_fee)
        end

        it 'assigns initial state' do
          expect(payment_item.state).to eq Billing::PaymentItemStateMachine.initial_state
        end
      end
    end
  end
end
