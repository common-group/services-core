# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::Integrations::WebhooksAPI, type: :api do
  include_examples 'authenticate routes', public_paths: ['POST /v2/integrations/webhooks/:provider']

  describe 'POST /v2/integrations/webhooks' do
    let(:webhook) { build(:integrations_webhook) }
    let(:request_params) { webhook.body.merge('provider' => webhook.provider) }
    let(:webhook_attributes) { { provider: webhook.provider, body: request_params, headers: webhook.headers } }
    let(:raw_data) { request_params.to_json }

    before do
      Grape::Endpoint.before_each do |endpoint|
        allow(endpoint).to receive(:raw_request_body).and_return(raw_data)
        allow(endpoint).to receive(:headers).and_return(webhook.headers)
      end
    end

    after do
      Grape::Endpoint.before_each nil
    end

    context 'when webhook is received with success' do
      before do
        allow(Integrations::Webhooks::Receive).to receive(:result)
          .with(attributes: webhook_attributes, raw_data: raw_data)
          .and_return(ServiceActor::Result.new(failure?: false))
      end

      it 'returns created address' do
        post "/api/v2/integrations/webhooks/#{webhook.provider}", params: request_params

        expect(response.body).to eq({ status: :ok }.to_json)
      end

      it 'return status 201 - created' do
        post "/api/v2/integrations/webhooks/#{webhook.provider}", params: request_params

        expect(response).to have_http_status(:created)
      end
    end

    context 'when webhook isn`t received with success' do
      before do
        allow(Integrations::Webhooks::Receive).to receive(:result)
          .with(attributes: webhook_attributes, raw_data: raw_data)
          .and_return(ServiceActor::Result.new(failure?: true))
      end

      it 'return status 500 - internal server error' do
        post "/api/v2/integrations/webhooks/#{webhook.provider}", params: request_params

        expect(response).to have_http_status(:internal_server_error)
      end
    end
  end
end
