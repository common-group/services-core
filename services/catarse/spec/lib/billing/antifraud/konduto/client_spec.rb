require 'rails_helper'

RSpec.describe Billing::Antifraud::Konduto::Client, type: :lib do
  let(:api_key) { Faker::Lorem.word }

  before { allow(CatarseSettings).to receive(:get_without_cache).with(:konduto_test_api_key).and_return(api_key) }

  describe 'Configuration' do
    it 'sets konduto base api' do
      expect(described_class.base_uri).to eq 'https://api.konduto.com/v1'
    end
  end

  describe 'Class methods' do
    describe '#api_key' do
      let(:test_api_key) { Faker::Lorem.word }
      let(:production_api_key) { Faker::Lorem.word }

      before do
        allow(CatarseSettings).to receive(:get_without_cache).with(:konduto_test_api_key).and_return(test_api_key)
        allow(CatarseSettings).to receive(:get_without_cache).with(:konduto_api_key).and_return(production_api_key)
      end

      context 'when is production environment' do
        before { allow(Rails).to receive_message_chain('env.production?').and_return(true) }

        it 'returns production api key' do
          expect(described_class.api_key).to eq production_api_key
        end
      end

      context 'when isn`t production environment' do
        before { allow(Rails).to receive_message_chain('env.production?').and_return(false) }

        it 'returns test api key' do
          expect(described_class.api_key).to eq test_api_key
        end
      end
    end
  end

  describe 'Public methods' do
    describe '#analyze_transaction' do
      let(:headers) { { 'Some-Header' => 'Value' } }
      let(:transaction_params) { { key: 'value' } }
      let(:request_response) { Hash[*Faker::Lorem.words(4)] }

      before do
        stub_request(:post, "#{described_class.base_uri}/orders")
          .with(body: transaction_params.to_json)
          .to_return(body: request_response, headers: { 'Content-Type' => 'application/json' })

        allow(subject).to receive(:headers).and_return(headers)
      end

      it 'makes a post request to orders and returns parsed body' do
        response = subject.analyze_transaction(transaction_params: transaction_params)

        expect(response).to eq request_response
      end
    end
  end

  describe 'Private methods' do
    describe '#headers' do
      it 'includes authorization header' do
        expect(subject.send(:headers)).to include('Authorization' => "Basic #{Base64.encode64(api_key)}")
      end

      it 'includes content type header' do
        expect(subject.send(:headers)).to include('Content-Type' => 'application/json')
      end
    end
  end
end
