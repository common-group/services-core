require 'rails_helper'

RSpec.describe Billing::PaymentRequest, type: :model do
  subject { described_class.aasm }

  describe 'States' do
    it 'has :waiting_payment as initial state' do
      expect(subject.initial_state).to eq :waiting_payment
    end

    it 'defines states' do
      expect(subject.states.map(&:name)).to eq %i[waiting_payment paid overdue refused refunded]
    end
  end

  describe 'Transitions' do
    context 'when state is waiting_payment' do
      subject { described_class.new(state: :waiting_payment) }

      it { is_expected.to allow_transition_to(:paid) }
      it { is_expected.to allow_transition_to(:overdue) }
      it { is_expected.to allow_transition_to(:refused) }
      it { is_expected.to_not allow_transition_to(:refunded) }

      it { is_expected.to allow_event(:settle) }
      it { is_expected.to allow_event(:expire) }
      it { is_expected.to allow_event(:refuse) }
      it { is_expected.to_not allow_event(:refund) }
    end

    context 'when state is paid' do
      subject { described_class.new(state: :paid) }

      it { is_expected.to allow_transition_to(:refunded) }
      it { is_expected.to_not allow_transition_to(:waiting_payment) }
      it { is_expected.to_not allow_transition_to(:overdue) }
      it { is_expected.to_not allow_transition_to(:refused) }

      it { is_expected.to_not allow_event(:settle) }
      it { is_expected.to_not allow_event(:expire) }
      it { is_expected.to_not allow_event(:refuse) }
      it { is_expected.to allow_event(:refund) }
    end

    context 'when state is overdue' do
      subject { described_class.new(state: :overdue) }

      it { is_expected.to_not allow_transition_to(:waiting_payment) }
      it { is_expected.to_not allow_transition_to(:paid) }
      it { is_expected.to_not allow_transition_to(:refused) }
      it { is_expected.to_not allow_transition_to(:refunded) }

      it { is_expected.to_not allow_event(:settle) }
      it { is_expected.to_not allow_event(:expire) }
      it { is_expected.to_not allow_event(:refuse) }
      it { is_expected.to_not allow_event(:refund) }
    end

    context 'when state is refused' do
      subject { described_class.new(state: :refused) }

      it { is_expected.to_not allow_transition_to(:waiting_payment) }
      it { is_expected.to_not allow_transition_to(:paid) }
      it { is_expected.to_not allow_transition_to(:overdue) }
      it { is_expected.to_not allow_transition_to(:refunded) }

      it { is_expected.to_not allow_event(:settle) }
      it { is_expected.to_not allow_event(:expire) }
      it { is_expected.to_not allow_event(:refuse) }
      it { is_expected.to_not allow_event(:refund) }
    end

    context 'when state is refunded' do
      subject { described_class.new(state: :refunded) }

      it { is_expected.to_not allow_transition_to(:waiting_payment) }
      it { is_expected.to_not allow_transition_to(:paid) }
      it { is_expected.to_not allow_transition_to(:overdue) }
      it { is_expected.to_not allow_transition_to(:refused) }

      it { is_expected.to_not allow_event(:settle) }
      it { is_expected.to_not allow_event(:expire) }
      it { is_expected.to_not allow_event(:refuse) }
      it { is_expected.to_not allow_event(:refund) }
    end
  end

  describe 'Callbacks' do
    describe '#after_all_transitions' do
      it 'creates state transitions' do
        expect(subject.state_machine.global_callbacks[:after_all_transitions]).to eq [:create_state_transition]
      end
    end
  end

  describe '#create_state_transition' do
    let(:payment_request) { create(:payment_request, :credit_card) }
    let(:state_transition) { payment_request.send(:create_state_transition) }

    before do
      allow(payment_request.aasm).to receive(:from_state).and_return(:waiting_payment)
      allow(payment_request.aasm).to receive(:to_state).and_return(:paid)
      allow(payment_request.aasm).to receive(:current_event).and_return(:settle)
    end

    it 'creates a payment request state transition with current state, previous state and event' do
      expect { state_transition }.to change(payment_request.state_transitions, :count).by(1)
      expect(state_transition.from_state).to eq 'waiting_payment'
      expect(state_transition.to_state).to eq 'paid'
      expect(state_transition.event).to eq 'settle'
    end
  end
end
