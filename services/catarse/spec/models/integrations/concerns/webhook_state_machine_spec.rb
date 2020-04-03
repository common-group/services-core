require 'rails_helper'

RSpec.describe Integrations::Webhook, type: :model do
  subject { described_class.aasm }

  describe 'States' do
    it 'has :waiting_payment as initial state' do
      expect(subject.initial_state).to eq :received
    end

    it 'defines states' do
      expect(subject.states.map(&:name)).to eq %i[
        received
        processing
        processed
        failed
        ignored
      ]
    end
  end

  describe 'Transitions' do
    context 'when state is received' do
      subject { described_class.new(state: :received) }

      %i[processing ignored failed].each do |state|
        it { is_expected.to allow_transition_to(state) }
      end

      %i[received processed].each do |state|
        it { is_expected.to_not allow_transition_to(state) }
      end

      %i[start_processing ignore fail].each do |event|
        it { is_expected.to allow_event(event) }
      end

      %i[finish_processing].each do |event|
        it { is_expected.to_not allow_event(event) }
      end
    end

    context 'when state is processing' do
      subject { described_class.new(state: :processing) }

      %i[processed failed].each do |state|
        it { is_expected.to allow_transition_to(state) }
      end

      %i[received processing ignored].each do |state|
        it { is_expected.to_not allow_transition_to(state) }
      end

      %i[finish_processing fail].each do |event|
        it { is_expected.to allow_event(event) }
      end

      %i[start_processing ignore].each do |event|
        it { is_expected.to_not allow_event(event) }
      end
    end

    context 'when state is processed' do
      subject { described_class.new(state: :processed) }

      %i[received processing processed failed ignored].each do |state|
        it { is_expected.to_not allow_transition_to(state) }
      end

      %i[start_processing finish_processing fail ignore].each do |event|
        it { is_expected.to_not allow_event(event) }
      end
    end

    context 'when state is failed' do
      subject { described_class.new(state: :failed) }

      %i[processing ignored].each do |state|
        it { is_expected.to allow_transition_to(state) }
      end

      %i[received processed failed].each do |state|
        it { is_expected.to_not allow_transition_to(state) }
      end

      %i[start_processing ignore].each do |event|
        it { is_expected.to allow_event(event) }
      end

      %i[finish_processing fail].each do |event|
        it { is_expected.to_not allow_event(event) }
      end
    end

    context 'when state is ignored' do
      subject { described_class.new(state: :ignored) }

      %i[received processing processed failed ignored].each do |state|
        it { is_expected.to_not allow_transition_to(state) }
      end

      %i[start_processing finish_processing fail ignore].each do |event|
        it { is_expected.to_not allow_event(event) }
      end
    end
  end
end

