# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::PaymentStateMachine, type: :state_machine do
  describe 'MAP_TO_PAYMENT_ITEM_STATE' do
    context 'when key is `created`' do
      subject { described_class::MAP_TO_PAYMENT_ITEM_STATE['created'] }

      it { is_expected.to eq :pending }
    end

    context 'when key is `waiting_payment`' do
      subject { described_class::MAP_TO_PAYMENT_ITEM_STATE['waiting_payment'] }

      it { is_expected.to eq :pending }
    end

    context 'when key is `authorized`' do
      subject { described_class::MAP_TO_PAYMENT_ITEM_STATE['authorized'] }

      it { is_expected.to eq :pending }
    end

    context 'when key is `approved_on_antifraud`' do
      subject { described_class::MAP_TO_PAYMENT_ITEM_STATE['approved_on_antifraud'] }

      it { is_expected.to eq :pending }
    end

    context 'when key is `declined_on_antifraud`' do
      subject { described_class::MAP_TO_PAYMENT_ITEM_STATE['declined_on_antifraud'] }

      it { is_expected.to eq :pending }
    end

    context 'when key is `waiting_review`' do
      subject { described_class::MAP_TO_PAYMENT_ITEM_STATE['waiting_review'] }

      it { is_expected.to eq :pending }
    end

    context 'when key is `paid`' do
      subject { described_class::MAP_TO_PAYMENT_ITEM_STATE['paid'] }

      it { is_expected.to eq :paid }
    end

    context 'when key is `overdue`' do
      subject { described_class::MAP_TO_PAYMENT_ITEM_STATE['overdue'] }

      it { is_expected.to eq :canceled }
    end

    context 'when key is `refused`' do
      subject { described_class::MAP_TO_PAYMENT_ITEM_STATE['refused'] }

      it { is_expected.to eq :canceled }
    end

    context 'when key is `refunded`' do
      subject { described_class::MAP_TO_PAYMENT_ITEM_STATE['refunded'] }

      it { is_expected.to eq :refunded }
    end

    context 'when key is `charged_back`' do
      subject { described_class::MAP_TO_PAYMENT_ITEM_STATE['charged_back'] }

      it { is_expected.to eq :charged_back }
    end
  end

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

  context 'when state is waiting_payment' do
    let(:payment) { create(:billing_payment, :waiting_payment) }

    it 'allows transition to paid' do
      expect { payment.transition_to!(:paid) }.not_to raise_error
    end

    it 'allows transition to overdue' do
      expect { payment.transition_to!(:overdue) }.not_to raise_error
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

  context 'when state is waiting_review' do
    let(:payment) { create(:billing_payment, :waiting_review) }

    it 'allows transition to paid' do
      expect { payment.transition_to!(:paid) }.not_to raise_error
    end

    it 'allows transition to refused' do
      expect { payment.transition_to!(:refused) }.not_to raise_error
    end
  end

  describe '.after_transition' do
    it 'updates payment state to new state' do
      payment = create(:billing_payment, :created)
      payment.state_machine.transition_to!(:waiting_payment)

      expect(payment.reload.state).to eq 'waiting_payment'
    end
  end

  describe '#wait_payment!' do
    subject(:state_machine) { create(:billing_payment, :created).state_machine }

    it 'transitions state to waiting_payment' do
      state_machine.wait_payment!

      expect(state_machine.object).to be_in_state(:waiting_payment)
    end
  end

  describe '#authorize!' do
    subject(:state_machine) { create(:billing_payment, :created).state_machine }

    it 'transitions state to authorized' do
      state_machine.authorize!

      expect(state_machine.object).to be_in_state(:authorized)
    end
  end

  describe '#settle!' do
    subject(:state_machine) { create(:billing_payment, :authorized).state_machine }

    it 'calls Billing::Payments::Settle action' do
      expect(Billing::Payments::Settle).to receive(:call).with(payment: state_machine.object, metadata: {})

      state_machine.settle!
    end
  end

  describe '#refuse!' do
    subject(:state_machine) { create(:billing_payment, :created).state_machine }

    it 'calls Billing::Payments::Refuse action' do
      expect(Billing::Payments::Refuse).to receive(:call).with(payment: state_machine.object, metadata: {})

      state_machine.refuse!
    end
  end

  describe '#approve_on_antifraud!' do
    subject(:state_machine) { create(:billing_payment, :authorized).state_machine }

    it 'transitions state to approved_on_antifraud' do
      state_machine.approve_on_antifraud!

      expect(state_machine.object).to be_in_state(:approved_on_antifraud)
    end
  end

  describe '#decline_on_antifraud!' do
    subject(:state_machine) { create(:billing_payment, :authorized).state_machine }

    it 'transitions state to declined_on_antifraud' do
      state_machine.decline_on_antifraud!

      expect(state_machine.object).to be_in_state(:declined_on_antifraud)
    end
  end

  describe '#wait_review!' do
    subject(:state_machine) { create(:billing_payment, :authorized).state_machine }

    it 'transitions state to waiting_review' do
      state_machine.wait_review!

      expect(state_machine.object).to be_in_state(:waiting_review)
    end
  end

  describe '#refund!' do
    subject(:state_machine) { create(:billing_payment, :paid).state_machine }

    it 'calls Billing::Payments::Refund action' do
      expect(Billing::Payments::Refund).to receive(:call).with(payment: state_machine.object, metadata: {})

      state_machine.refund!
    end
  end

  describe '#chargeback!' do
    subject(:state_machine) { create(:billing_payment, :paid).state_machine }

    it 'calls Billing::Payments::Chargeback action' do
      expect(Billing::Payments::Chargeback).to receive(:call).with(payment: state_machine.object, metadata: {})

      state_machine.chargeback!
    end
  end

  describe '#expire!' do
    subject(:state_machine) { create(:billing_payment, :waiting_payment).state_machine }

    it 'calls Billing::Payments::Expire action' do
      expect(Billing::Payments::Expire).to receive(:call).with(payment: state_machine.object, metadata: {})

      state_machine.expire!
    end
  end
end
