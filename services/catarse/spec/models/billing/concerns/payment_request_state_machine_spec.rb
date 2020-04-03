require 'rails_helper'

RSpec.describe Billing::PaymentRequest, type: :model do
  subject { described_class.aasm }

  describe 'States' do
    it 'has :waiting_payment as initial state' do
      expect(subject.initial_state).to eq :created
    end

    it 'defines states' do
      expect(subject.states.map(&:name)).to eq %i[
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
        chargedback
      ]
    end
  end

  describe 'Transitions' do
    context 'when state is created' do
      subject { described_class.new(state: :created) }

      %i[refused].each do |state|
        it { is_expected.to allow_transition_to(state) }
      end

      %i[approved_on_antifraud declined_on_antifraud waiting_review paid overdue refunded chargedback].each do |state|
        it { is_expected.to_not allow_transition_to(state) }
      end

      %i[refuse].each do |event|
        it { is_expected.to allow_event(event) }
      end

      context 'when is a credit card payment request' do
        subject { described_class.new(state: :created, payment_method: :credit_card) }

        it { is_expected.to allow_transition_to(:authorized) }
        it { is_expected.to_not allow_transition_to(:waiting_payment) }

        it { is_expected.to allow_event(:authorize) }
        it { is_expected.to_not allow_event(:wait_payment) }
      end

      context 'when is a bank slip payment request' do
        subject { described_class.new(state: :created, payment_method: :bank_slip) }

        it { is_expected.to allow_transition_to(:waiting_payment) }
        it { is_expected.to_not allow_transition_to(:authorized) }

        it { is_expected.to allow_event(:wait_payment) }
        it { is_expected.to_not allow_event(:authorize) }
      end

      %i[approve decline wait_review settle expire refund chargeback].each do |event|
        it { is_expected.to_not allow_event(event) }
      end
    end

    context 'when state is waiting_payment' do
      subject { described_class.new(state: :waiting_payment) }

      %i[paid overdue].each do |state|
        it { is_expected.to allow_transition_to(state) }
      end

      %i[created waiting_payment authorized approved_on_antifraud declined_on_antifraud waiting_review
        refused refunded chargedback].each do |state|
        it { is_expected.to_not allow_transition_to(state) }
      end

      %i[settle expire].each do |event|
        it { is_expected.to allow_event(event) }
      end

      %i[authorize wait_payment approve decline wait_review refuse refund chargeback].each do |event|
        it { is_expected.to_not allow_event(event) }
      end
    end

    context 'when state is authorized' do
      subject { described_class.new(state: :authorized) }

      %i[approved_on_antifraud declined_on_antifraud waiting_review paid].each do |state|
        it { is_expected.to allow_transition_to(state) }
      end

      %i[created waiting_payment authorized overdue refused refunded chargedback].each do |state|
        it { is_expected.to_not allow_transition_to(state) }
      end

      %i[approve decline wait_review settle].each do |event|
        it { is_expected.to allow_event(event) }
      end

      %i[authorize wait_payment expire refuse refund chargeback].each do |event|
        it { is_expected.to_not allow_event(event) }
      end
    end

    context 'when state is approved_on_antifraud' do
      subject { described_class.new(state: :approved_on_antifraud) }

      %i[paid].each do |state|
        it { is_expected.to allow_transition_to(state) }
      end

      %i[created waiting_payment authorized approved_on_antifraud declined_on_antifraud waiting_review overdue
        refused refunded chargedback].each do |state|
        it { is_expected.to_not allow_transition_to(state) }
      end

      %i[settle].each do |event|
        it { is_expected.to allow_event(event) }
      end

      %i[authorize wait_payment approve decline wait_review expire refuse refund chargeback].each do |event|
        it { is_expected.to_not allow_event(event) }
      end
    end

    context 'when state is declined_on_antifraud' do
      subject { described_class.new(state: :declined_on_antifraud) }

      %i[refused].each do |state|
        it { is_expected.to allow_transition_to(state) }
      end

      %i[created waiting_payment authorized approved_on_antifraud declined_on_antifraud waiting_review paid overdue
        refunded chargedback].each do |state|
        it { is_expected.to_not allow_transition_to(state) }
      end

      %i[refuse].each do |event|
        it { is_expected.to allow_event(event) }
      end

      %i[authorize wait_payment approve decline wait_review settle expire refund chargeback].each do |event|
        it { is_expected.to_not allow_event(event) }
      end
    end

    context 'when state is waiting_review' do
      subject { described_class.new(state: :waiting_review) }

      %i[paid refused].each do |state|
        it { is_expected.to allow_transition_to(state) }
      end

      %i[created waiting_payment authorized approved_on_antifraud declined_on_antifraud waiting_review overdue
        refunded chargedback].each do |state|
        it { is_expected.to_not allow_transition_to(state) }
      end

      %i[settle refuse].each do |event|
        it { is_expected.to allow_event(event) }
      end

      %i[authorize wait_payment approve decline wait_review expire refund chargeback].each do |event|
        it { is_expected.to_not allow_event(event) }
      end
    end

    context 'when state is paid' do
      subject { described_class.new(state: :paid) }

      %i[refunded chargedback].each do |state|
        it { is_expected.to allow_transition_to(state) }
      end

      %i[created waiting_payment authorized approved_on_antifraud declined_on_antifraud waiting_review paid overdue
        refused].each do |state|
        it { is_expected.to_not allow_transition_to(state) }
      end

      %i[refund chargeback].each do |event|
        it { is_expected.to allow_event(event) }
      end

      %i[authorize wait_payment approve decline wait_review settle expire refuse].each do |event|
        it { is_expected.to_not allow_event(event) }
      end
    end

    context 'when state is overdue' do
      subject { described_class.new(state: :overdue) }

      %i[created waiting_payment authorized approved_on_antifraud declined_on_antifraud waiting_review paid overdue
        refused refunded chargedback].each do |state|
        it { is_expected.to_not allow_transition_to(state) }
      end

      %i[authorize wait_payment approve decline wait_review settle expire refuse refund chargeback].each do |event|
        it { is_expected.to_not allow_event(event) }
      end
    end

    context 'when state is refused' do
      subject { described_class.new(state: :refused) }

      %i[created waiting_payment authorized approved_on_antifraud declined_on_antifraud waiting_review paid overdue
        refused refunded chargedback].each do |state|
        it { is_expected.to_not allow_transition_to(state) }
      end

      %i[authorize wait_payment approve decline wait_review settle expire refuse refund chargeback].each do |event|
        it { is_expected.to_not allow_event(event) }
      end
    end

    context 'when state is refunded' do
      subject { described_class.new(state: :refunded) }

      %i[created waiting_payment authorized approved_on_antifraud declined_on_antifraud waiting_review paid overdue
        refused refunded chargedback].each do |state|
        it { is_expected.to_not allow_transition_to(state) }
      end

      %i[authorize wait_payment approve decline wait_review settle expire refuse refund chargeback].each do |event|
        it { is_expected.to_not allow_event(event) }
      end
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
    let(:state_transition) { payment_request.send(:create_state_transition, { metadata: { some: { data: 'here' } } }) }

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
      expect(state_transition.metadata).to eq('some' => { 'data' => 'here' })
    end
  end
end
