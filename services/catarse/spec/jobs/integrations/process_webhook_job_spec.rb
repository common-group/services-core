# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Integrations::ProcessWebhookJob, type: :job do
  describe '#perform' do
    let(:webhook) { create(:integrations_webhook) }
    let(:processor) { instance_double(webhook.provider_object.processor) }

    before do
      allow(webhook.provider_object.processor).to receive(:new).with(webhook: webhook).and_return(processor)
    end

    it 'processes webhook with its own processor' do
      expect(processor).to receive(:run)

      described_class.perform_now(webhook.id)
    end

    context 'when an error happens' do
      let(:error) { StandardError.new('some error') }

      before { allow(processor).to receive(:run).and_raise(error) }

      it 'captures error with Sentry' do
        expect(Sentry).to receive(:capture_exception).with(error, level: :fatal, extra: { webhook_id: webhook.id })

        described_class.perform_now(webhook.id)
      end
    end
  end
end
