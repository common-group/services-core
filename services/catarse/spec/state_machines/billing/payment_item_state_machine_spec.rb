# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::PaymentItemStateMachine, type: :state_machine do
  describe '.states' do
    it 'returns payment item states list' do
      expect(described_class.states).to eq %w[pending paid canceled refunded charged_back]
    end
  end

  describe 'Transitions' do
    context 'when state is pending' do
      let(:payment_item) { create(:billing_payment_item, :pending) }

      it 'allows transition to paid' do
        expect { payment_item.state_machine.transition_to!(:paid) }.not_to raise_error
      end

      it 'allows transition to canceled' do
        expect { payment_item.state_machine.transition_to!(:canceled) }.not_to raise_error
      end
    end

    context 'when state is paid' do
      let(:payment_item) { create(:billing_payment_item, :paid) }

      it 'allows transition to refunded' do
        expect { payment_item.state_machine.transition_to!(:refunded) }.not_to raise_error
      end

      it 'allows transition to charged_back' do
        expect { payment_item.state_machine.transition_to!(:charged_back) }.not_to raise_error
      end
    end
  end

  describe '#settle!' do
    subject(:state_machine) { create(:billing_payment_item, :pending).state_machine }

    it 'calls Billing::Payments::Settle action' do
      expect(Billing::PaymentItems::Settle).to receive(:call).with(payment_item: state_machine.object, metadata: {})

      state_machine.settle!
    end
  end

  describe '#cancel!' do
    subject(:state_machine) { create(:billing_payment_item, :pending).state_machine }

    it 'calls Billing::Payments::Cancel action' do
      expect(Billing::PaymentItems::Cancel).to receive(:call).with(payment_item: state_machine.object, metadata: {})

      state_machine.cancel!
    end
  end

  describe '#refund!' do
    subject(:state_machine) { create(:billing_payment_item, :paid).state_machine }

    it 'calls Billing::Payments::Refund action' do
      expect(Billing::PaymentItems::Refund).to receive(:call).with(payment_item: state_machine.object, metadata: {})

      state_machine.refund!
    end
  end

  describe '#chargeback!' do
    subject(:state_machine) { create(:billing_payment_item, :paid).state_machine }

    it 'calls Billing::Payments::Chargeback action' do
      expect(Billing::PaymentItems::Chargeback).to receive(:call).with(payment_item: state_machine.object, metadata: {})

      state_machine.chargeback!
    end
  end

  describe '.after_transition' do
    it 'updates payment state to new state' do
      payment_item = create(:billing_payment_item, :pending)
      payment_item.state_machine.transition_to!(:paid)

      expect(payment_item.reload.state).to eq 'paid'
    end
  end
end
