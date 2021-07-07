# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::SubscriptionStateMachine, type: :state_machine do
  describe '.states' do
    it 'returns payment item states list' do
      expect(described_class.states).to eq %w[started active canceling canceled inactive deleted]
    end
  end

  describe 'Transitions' do
    context 'when state is started' do
      it 'allows transition to active' do
        subscription = create(:membership_subscription, :started)

        expect { subscription.transition_to!(:active) }.not_to raise_error
      end

      it 'allows transition to deleted' do
        subscription = create(:membership_subscription, :started)

        expect { subscription.transition_to!(:deleted) }.not_to raise_error
      end
    end

    context 'when state is active' do
      it 'allows transition to canceling' do
        subscription = create(:membership_subscription, :active)

        expect { subscription.transition_to!(:canceling) }.not_to raise_error
      end

      it 'allows transition to inactive' do
        subscription = create(:membership_subscription, :active)

        expect { subscription.transition_to!(:inactive) }.not_to raise_error
      end
    end

    context 'when state is canceling' do
      it 'allows transition to canceled' do
        subscription = create(:membership_subscription, :canceling)

        expect { subscription.transition_to!(:canceled) }.not_to raise_error
      end
    end

    context 'when state is inactive' do
      it 'allows transition to active' do
        subscription = create(:membership_subscription, :inactive)

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
