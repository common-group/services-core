# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Integrations::Webhook, type: :model do
  it_behaves_like 'has state machine' do
    let(:record) { create(:integrations_webhook) }
  end

  describe 'Configurations' do
    it 'setups provider with Integrations::WebhookProviders enum' do
      expect(described_class.enumerations).to include(provider: Integrations::WebhookProviders)
    end
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of :body }
    it { is_expected.to validate_presence_of :provider }
  end

  describe '#processor' do
    subject(:webhook) { build(:integrations_webhook) }

    let(:processor) { instance_double(webhook.provider_object.processor) }

    before do
      allow(webhook.provider_object.processor).to receive(:new).with(webhook: webhook).and_return(processor)
    end

    it 'returns a new processor instance from provider object' do
      expect(webhook.processor).to eq processor
    end
  end
end
