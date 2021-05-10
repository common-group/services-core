# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Integrations::Webhooks::Create, type: :action do
  describe 'inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(attributes: { type: Hash }) }
  end

  describe 'outputs' do
    subject { described_class.outputs }

    it { is_expected.to include(webhook: { type: Integrations::Webhook }) }
  end

  describe '#call' do
    subject(:result) { described_class.result(attributes: attributes) }

    let(:attributes) { attributes_for(:integrations_webhook, state: nil).stringify_keys }

    it { is_expected.to be_success }

    it 'creates a new webhook' do
      expect { result }.to change(Integrations::Webhook, :count).by(1)
    end

    it 'creates webhook with given attributes and initial state' do
      webhook = result.webhook
      initial_state = Integrations::WebhookStateMachine.initial_state

      expect(webhook.reload.attributes).to include(attributes.merge('state' => initial_state))
    end
  end
end
