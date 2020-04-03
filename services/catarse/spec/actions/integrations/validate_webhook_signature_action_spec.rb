require 'rails_helper'

RSpec.describe Integrations::ValidateWebhookSignatureAction, type: :action do
  describe 'Behavior' do
    let(:webhook) { build(:webhook) }

    let(:provider) { webhook.provider }
    let(:body) { webhook.body }
    let(:headers) { webhook.headers }
    let(:raw_data) { webhook.body.to_json }
    let(:validator) { Integrations::Webhook::SIGNATURE_VALIDATORS[provider.to_s] }

    context 'when signature is valid' do

      before do
        allow(validator).to receive(:valid?).with(body: body, headers: headers, raw_data: raw_data).and_return(true)
      end

      it 'skips to next context' do
        expect(Raven).to_not receive(:capture_message)

        result = described_class.execute(provider: provider, body: body, headers: headers, raw_data: raw_data)

        expect(result).to be_success
      end
    end

    context 'when signature is invalid' do
      before do
        allow(validator).to receive(:valid?).with(body: body, headers: headers, raw_data: raw_data).and_return(false)
      end

      it 'captures message via Raven' do
        expect(Raven).to receive(:capture_message).with(
          'Webhook invalid signature',
          level: :error,
          extra: { provider: provider, body: body, headers: headers }
        )

        described_class.execute(provider: provider, body: body, headers: headers, raw_data: raw_data)
      end

      it 'fails context and return' do
        result = described_class.execute(provider: provider, body: body, headers: headers, raw_data: raw_data)

        expect(result).to be_failure
        expect(result.message).to eq 'Invalid signature'
      end
    end
  end
end
