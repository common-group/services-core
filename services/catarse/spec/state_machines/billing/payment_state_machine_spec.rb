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

  context 'when state is created' do
    let(:payment) { create(:billing_payment, :created) }

    it 'allows transition to waiting_payment' do
      expect { payment.transition_to!(:waiting_payment) }.not_to raise_error
    end

    it 'allows transition to authorized' do
      expect { payment.transition_to!(:authorized) }.not_to raise_error
    end

    it 'allows transition to refused' do
      expect { payment.transition_to!(:refused) }.not_to raise_error
    end
  end

  context 'when state is authorized' do
    let(:payment) { create(:billing_payment, :authorized) }

    it 'allows transition to approved_on_antifraud' do
      expect { payment.transition_to!(:approved_on_antifraud) }.not_to raise_error
    end

    it 'allows transition to declined_on_antifraud' do
      expect { payment.transition_to!(:declined_on_antifraud) }.not_to raise_error
    end

    it 'allows transition to waiting_review' do
      expect { payment.transition_to!(:waiting_review) }.not_to raise_error
    end

    it 'allows transition to paid' do
      expect { payment.transition_to!(:paid) }.not_to raise_error
    end
  end

  context 'when state is paid' do
    let(:payment) { create(:billing_payment, :paid) }

    it 'allows transition to charged_back' do
      expect { payment.transition_to!(:charged_back) }.not_to raise_error
    end

    it 'allows transition to refunded' do
      expect { payment.transition_to!(:refunded) }.not_to raise_error
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
