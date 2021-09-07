# frozen_string_literal: true

RSpec.shared_examples 'has state machine' do
  describe 'Relations' do
    subject(:record) { described_class.new }

    it do
      expect(record).to have_many(:state_transitions)
        .class_name("#{described_class}StateTransition")
        .dependent(:destroy)
        .autosave(false)
    end
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:state) }
    it { is_expected.to validate_inclusion_of(:state).in_array("#{described_class}StateMachine".constantize.states) }
  end

  describe 'Delegations' do
    subject { described_class.new }

    %i[
      can_transition_to? current_state history last_transition transition_to! transition_to in_state?
    ].each do |method|
      it { is_expected.to delegate_method(method).to(:state_machine) }
    end
  end

  describe 'Callbacks' do
    describe '#after_create' do
      it 'creates a state transition' do
        expect(record.state_transitions.last.attributes).to include(
          'to_state' => record.state, 'sort_key' => 1, 'most_recent' => true
        )
      end
    end
  end
end
