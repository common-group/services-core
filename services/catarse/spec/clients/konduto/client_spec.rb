# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Konduto::Client, type: :client do
  subject(:client) { described_class.new }

  let(:api_key) { Faker::Lorem.word }

  before { allow(CatarseSettings).to receive(:get_without_cache).with(:konduto_test_api_key).and_return(api_key) }

  describe 'Configuration' do
    it 'sets konduto base api' do
      expect(described_class.base_uri).to eq 'https://api.konduto.com/v1'
    end
  end

  describe '#create_order' do
    let(:headers) { { 'Authorization' => "Basic #{Base64.encode64(api_key).chomp}" } }
    let(:order_params) { { key: 'value' } }
    let(:request_response) { Hash[*Faker::Lorem.words(number: 4)] }

    before do
      stub_request(:post, "#{described_class.base_uri}/orders")
        .with(body: order_params.to_json, headers: headers)
        .to_return(body: request_response.to_json, headers: { 'Content-Type' => 'application/json' })
    end

    it 'makes a post request to orders and returns parsed body' do
      response = client.create_order(order_params)

      expect(response).to eq request_response
    end
  end
end
