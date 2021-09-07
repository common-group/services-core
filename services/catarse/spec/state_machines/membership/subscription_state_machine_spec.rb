# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::SubscriptionStateMachine, type: :state_machine do
  describe '.states' do
    it 'returns payment item states list' do
      expect(described_class.states).to eq %w[started active canceling canceled inactive deleted]
    end
  end

  describe 'Transitions' do
    let(:subscription) { create(:membership_subscription, state) }

    context 'when state is started' do
      let(:state) { :started }

      it 'allows transition to active' do
        expect { subscription.transition_to!(:active) }.not_to raise_error
      end

      it 'allows transition to deleted' do
        expect { subscription.transition_to!(:deleted) }.not_to raise_error
      end
    end

    context 'when state is active' do
      let(:state) { :active }

      it 'allows transition to canceling' do
        expect { subscription.transition_to!(:canceling) }.not_to raise_error
      end

      it 'allows transition to inactive' do
        expect { subscription.transition_to!(:inactive) }.not_to raise_error
      end

      it 'allows transition to active' do
        expect { subscription.transition_to!(:active) }.not_to raise_error
      end
    end

    context 'when state is canceling' do
      let(:state) { :canceling }

      it 'allows transition to canceled' do
        expect { subscription.transition_to!(:canceled) }.not_to raise_error
      end
    end

    context 'when state is inactive' do
      let(:state) { :inactive }

      it 'allows transition to active' do
        expect { subscription.transition_to!(:active) }.not_to raise_error
      end
    end
  end

  describe '.after_transition' do
    it 'updates subscription to new state' do
      subscription = create(:membership_subscription, :started)
      subscription.state_machine.transition_to!(:active)

      expect(subscription.reload).to be_in_state(:active)
    end
  end
end
