require 'rails_helper'

RSpec.describe Integrations::ProcessWebhookAction, type: :action do
  describe 'Behavior' do
    context 'when webhook can be processed' do
      let(:webhook) { double(id: Faker::Lorem.word, may_start_processing?: true) }

      it 'adds a new job to processing worker queue' do
        expect do
          described_class.execute(webhook: webhook)
        end.to change(Integrations::ProcessWebhookWorker.jobs, :size).by(1)
      end
    end

    context 'when webhook cannot be processed' do
      let(:webhook) { double(id: Faker::Lorem.word, may_start_processing?: false) }

      it 'fails execution' do
        result = described_class.execute(webhook: webhook)
        expect(result).to be_failure
        expect(result.message).to eq 'Webhook cannot be processed'
        expect(Integrations::ProcessWebhookWorker.jobs).to be_empty
      end
    end
  end
end
