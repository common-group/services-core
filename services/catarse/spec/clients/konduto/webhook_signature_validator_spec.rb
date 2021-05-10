# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Konduto::WebhookSignatureValidator, type: :lib do
  describe '.valid?' do
    let(:api_key) { Faker::Lorem.word }
    let(:body) do
      { 'order_id' => Faker::Lorem.word, 'timestamp' => Faker::Lorem.word, 'status' => Faker::Lorem.word }
    end
    let(:string) { "#{body['order_id']}##{body['timestamp']}##{body['status']}" }

    before do
      allow(CatarseSettings).to receive(:get_without_cache).with(:konduto_test_api_key).and_return(api_key)
      body['signature'] = signature
    end

    context 'when signature is valid' do
      let(:signature) { OpenSSL::HMAC.hexdigest('SHA256', api_key, string) }

      it 'returns true' do
        expect(described_class.valid?(body: body)).to be(true)
      end
    end

    context 'when signature is invalid' do
      let(:signature) { 'FAKE SIGNATURE' }

      it 'returns false' do
        expect(described_class.valid?(body: body)).to be(false)
      end
    end
  end
end
