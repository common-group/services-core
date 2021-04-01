# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::PaymentStateMachine, type: :state_machine do
  describe '.initial_state' do
    it 'returns `created`' do
      expect(described_class.initial_state).to eq 'created'
    end
  end

  describe '.states' do
    let(:states_list) do
      %w[
        created
        waiting_payment
        authorized
        approved_on_antifraud
        declined_on_antifraud
        waiting_review
        paid
        overdue
        refused
        refunded
        charged_back
      ]
    end

    it 'returns payment states list' do
      expect(described_class.states).to eq states_list
    end
  end

  describe 'Transitions' do
    it 'allows transition from created to waiting_payment' do
      payment = create(:billing_payment, :created)

      expect { payment.state_machine.transition_to!(:waiting_payment) }.not_to raise_error
    end
  end

  describe '.after_transition' do
    it 'updates payment state to new state' do
      payment = create(:billing_payment, :created)
      payment.state_machine.transition_to!(:waiting_payment)

      expect(payment.reload.state).to eq 'waiting_payment'
    end
  end
end
