# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Integrations::WebhookStateMachine, type: :state_machine do
  describe '.initial_state' do
    it 'returns received' do
      expect(described_class.initial_state).to eq 'received'
    end
  end

  describe '.states' do
    let(:states_list) do
      %w[received processing processed failed ignored]
    end

    it 'returns webhook states list' do
      expect(described_class.states).to eq states_list
    end
  end

  context 'when state is received' do
    let(:webhook) { create(:integrations_webhook, :received) }

    it 'allows transition to processing' do
      expect { webhook.transition_to!(:processing) }.not_to raise_error
    end

    it 'allows transition to failed' do
      expect { webhook.transition_to!(:failed) }.not_to raise_error
    end

    it 'allows transition to ignored' do
      expect { webhook.transition_to!(:ignored) }.not_to raise_error
    end
  end

  context 'when state is processing' do
    let(:webhook) { create(:integrations_webhook, :processing) }

    it 'allows transition to processed' do
      expect { webhook.transition_to!(:processed) }.not_to raise_error
    end

    it 'allows transition to failed' do
      expect { webhook.transition_to!(:failed) }.not_to raise_error
    end
  end

  context 'when state is failed' do
    let(:webhook) { create(:integrations_webhook, :failed) }

    it 'allows transition to processing' do
      expect { webhook.transition_to!(:processing) }.not_to raise_error
    end

    it 'allows transition to ignored' do
      expect { webhook.transition_to!(:ignored) }.not_to raise_error
    end
  end

  describe '.after_transition' do
    it 'updates webhook state to new state' do
      webhook = create(:integrations_webhook, :received)
      webhook.state_machine.transition_to!(:processing)

      expect(webhook.reload.state).to eq 'processing'
    end
  end
end
