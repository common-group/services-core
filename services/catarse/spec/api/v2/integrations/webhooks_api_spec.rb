require 'rails_helper'

RSpec.describe Catarse::V2::Integrations::WebhooksAPI, type: :api do
  describe 'POST /v2/integrations/webhooks/:provider' do
    let(:webhook) { build(:webhook) }

    before do
      Grape::Endpoint.before_each do |endpoint|
        allow(endpoint).to receive(:raw_request_body).and_return(webhook.body.to_json)
        allow(endpoint).to receive(:headers).and_return(webhook.headers)
      end
    end

    after do
      Grape::Endpoint.before_each nil
    end

    it 'receives webhook' do
      expect(Integrations::ReceiveWebhook).to receive(:call).with(
        provider: webhook.provider.to_s,
        body: webhook.body.merge(provider: webhook.provider.to_s),
        headers: webhook.headers,
        raw_data: webhook.body.to_json
      )

      post '/v2/integrations/webhooks/' + webhook.provider.to_s, webhook.body
    end

    it 'has http status OK' do
      allow(Integrations::ReceiveWebhook).to receive(:call).with(
        provider: webhook.provider.to_s,
        body: webhook.body.merge(provider: webhook.provider.to_s),
        headers: webhook.headers,
        raw_data: webhook.body.to_json
      )

      post '/v2/integrations/webhooks/' + webhook.provider.to_s, webhook.body

      expect(last_response.status).to eq Rack::Utils::SYMBOL_TO_STATUS_CODE[:ok]
      expect(last_response.body).to eq({ status: "ok" }.to_json)
    end
  end
end
