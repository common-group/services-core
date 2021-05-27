# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::PaymentItemStateMachine, type: :state_machine do
  describe '.states' do
    it 'returns payment item states list' do
      expect(described_class.states).to eq %w[pending paid canceled refunded charged_back]
    end
  end

  describe 'Transitions' do
    it 'allows transition from created to paid' do
      payment_item = create(:billing_payment_item, :pending)

      expect { payment_item.state_machine.transition_to!(:paid) }.not_to raise_error
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
