
require 'rails_helper'

RSpec.describe Integrations::ProcessWebhookWorker, type: :worker do
  describe '#perform' do
    let(:webhook) { create(:webhook) }
    let(:processor_class) { Integrations::Webhook::PROCESSORS[webhook.provider.to_s] }
    let(:processor) { double }

    before do
      allow(Integrations::Webhook).to receive(:find).with(webhook.id).and_return(webhook)
      allow(processor_class).to receive(:new).with(webhook).and_return(processor)
    end

    it 'processes webhook' do
      expect(processor).to receive(:process!)

      subject.perform(webhook.id)
    end
  end
end
