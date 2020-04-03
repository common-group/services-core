require 'rails_helper'

RSpec.describe Integrations::CreateWebhookAction, type: :action do
  describe 'Behavior' do
    context 'with valid attributes' do
      let(:valid_params) { attributes_for(:webhook) }
      let(:result) { described_class.execute(valid_params) }

      it 'creates a new webhook' do
        expect { result }.to change(Integrations::Webhook, :count).by(1)
        expect(result.webhook).to be_a(Integrations::Webhook)
        expect(result.webhook).to be_persisted
        expect(result.webhook.provider.to_s).to eq valid_params[:provider]
        expect(result.webhook.body).to eq valid_params[:body]
        expect(result.webhook.headers).to eq valid_params[:headers]
      end
    end

    context 'with invalid attributes' do
      let(:invalid_params) { attributes_for(:webhook, provider: '') }
      let(:result) { described_class.execute(invalid_params) }

      it 'raises exception' do
        expect { result }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end
  end
end
