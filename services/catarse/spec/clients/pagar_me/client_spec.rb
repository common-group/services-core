# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PagarMe::Client, type: :client do
  subject(:client) { described_class.new }

  let(:api_key) { Faker::Lorem.word }

  before { allow(CatarseSettings).to receive(:get_without_cache).with(:pagarme_test_api_key).and_return(api_key) }

  describe 'Configurations' do
    it 'sets pagarme base api' do
      expect(described_class.base_uri).to eq 'https://api.pagar.me/1'
    end
  end

  describe '#create_transaction' do
    let(:transaction_params) { { key: 'value' } }
    let(:request_response) { Hash[*Faker::Lorem.words(number: 4)].to_json }

    before do
      stub_request(:post, "#{described_class.base_uri}/transactions")
        .with(body: transaction_params.merge(api_key: api_key))
        .to_return(body: request_response, headers: { 'Content-Type' => 'application/json' })
    end

    it 'creates transaction' do
      response = client.create_transaction(transaction_params)

      expect(response).to eq JSON.parse(request_response)
    end
  end

  describe '#capture_transaction' do
    let(:transaction_id) { Faker::Lorem.word }
    let(:request_response) { Hash[*Faker::Lorem.words(number: 4)].to_json }

    before do
      stub_request(:post, "#{described_class.base_uri}/transactions/#{transaction_id}/capture")
        .with(body: { api_key: api_key })
        .to_return(body: request_response, headers: { 'Content-Type' => 'application/json' })
    end

    it 'captures transaction' do
      response = client.capture_transaction(transaction_id)

      expect(response.parsed_response).to eq JSON.parse(request_response)
    end

    context 'when request is successfull' do
      it 'doesn`t capture message via Sentry' do
        expect(Sentry).not_to receive(:capture_message)

        client.capture_transaction(transaction_id)
      end
    end

    context 'when request fails' do
      let(:error_message) { 'Transaction cannot be captured on gateway' }

      before do
        stub_request(:post, "#{described_class.base_uri}/transactions/#{transaction_id}/capture")
          .with(body: { api_key: api_key })
          .to_return(status: 500, body: request_response, headers: { 'Content-Type' => 'application/json' })
      end

      it 'captures error message via Sentry' do
        options = { level: :fatal, extra: { data: JSON.parse(request_response) } }
        expect(Sentry).to receive(:capture_message).with(error_message, options)

        client.capture_transaction(transaction_id)
      end
    end
  end

  describe '#refund_transaction' do
    let(:transaction_id) { Faker::Lorem.word }
    let(:request_response) { Hash[*Faker::Lorem.words(number: 4)].to_json }

    before do
      stub_request(:post, "#{described_class.base_uri}/transactions/#{transaction_id}/refund")
        .with(body: { api_key: api_key })
        .to_return(body: request_response, headers: { 'Content-Type' => 'application/json' })
    end

    it 'refunds transaction' do
      response = client.refund_transaction(transaction_id)

      expect(response.parsed_response).to eq JSON.parse(request_response)
    end

    context 'when request is successfull' do
      it 'doesn`t capture message via Sentry' do
        expect(Sentry).not_to receive(:capture_message)

        client.refund_transaction(transaction_id)
      end
    end

    context 'when request fails' do
      let(:error_message) { 'Transaction cannot be refunded on gateway' }

      before do
        stub_request(:post, "#{described_class.base_uri}/transactions/#{transaction_id}/refund")
          .with(body: { api_key: api_key })
          .to_return(status: 500, body: request_response, headers: { 'Content-Type' => 'application/json' })
      end

      it 'captures message via Sentry' do
        options = { level: :fatal, extra: { data: JSON.parse(request_response) } }
        expect(Sentry).to receive(:capture_message).with(error_message, options)

        client.refund_transaction(transaction_id)
      end
    end
  end
end
