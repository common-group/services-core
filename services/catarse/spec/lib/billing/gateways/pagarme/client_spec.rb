require 'rails_helper'

RSpec.describe Billing::Gateways::Pagarme::Client, type: :lib do
  let(:api_key) { Faker::Lorem.word }

  before { allow(CatarseSettings).to receive(:get_without_cache).with(:pagarme_test_api_key).and_return(api_key) }

  describe 'Configuration' do
    it 'sets pagarme base api' do
      expect(described_class.base_uri).to eq 'https://api.pagar.me/1'
    end
  end

  describe 'Class methods' do
    describe '#api_key' do
      let(:test_api_key) { Faker::Lorem.word }
      let(:production_api_key) { Faker::Lorem.word }

      before do
        allow(CatarseSettings).to receive(:get_without_cache).with(:pagarme_test_api_key).and_return(test_api_key)
        allow(CatarseSettings).to receive(:get_without_cache).with(:pagarme_api_key).and_return(production_api_key)
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
    describe '#create_transction' do
      let(:transaction_params) { { key: 'value' } }
      let(:request_response) { Hash[*Faker::Lorem.words(4)].to_json }

      before do
        stub_request(:post, "#{described_class.base_uri}/transactions")
          .with(body: transaction_params.merge(api_key: api_key))
          .to_return(body: request_response, headers: { 'Content-Type' => 'application/json' })
      end

      it 'makes a post to transaction and returns response body' do
        response = subject.create_transaction(transaction_params: transaction_params)
        expected_response = JSON.parse(request_response)

        expect(response).to eq expected_response
      end
    end

    describe '#capture_transaction' do
      let(:gateway_id) { Faker::Lorem.word }
      let(:request_response) { Hash[*Faker::Lorem.words(4)].to_json }

      before do
        stub_request(:post, "#{described_class.base_uri}/transactions/#{gateway_id}/capture")
          .with(body: { api_key: api_key })
          .to_return(body: request_response, headers: { 'Content-Type' => 'application/json' })
      end

      it 'makes a post request to capture transaction and returns response' do
        response = subject.capture_transaction(gateway_id: gateway_id)

        expect(response).to be_success
        expect(response.body).to eq request_response
      end

      context 'when request is successfull' do
        it 'doesn`t capture message via Raven' do
          expect(Raven).to_not receive(:capture_message)

          subject.capture_transaction(gateway_id: gateway_id)
        end
      end

      context 'when request fails' do
        before do
          stub_request(:post, "#{described_class.base_uri}/transactions/#{gateway_id}/capture")
            .with(body: { api_key: api_key })
            .to_return(status: 500, body: request_response, headers: { 'Content-Type' => 'application/json' })
        end

        it 'captures message via Raven' do
          expect(Raven).to receive(:capture_message)
            .with('Transaction cannot be captured on gateway', level: :fatal, extra: JSON.parse(request_response))

          subject.capture_transaction(gateway_id: gateway_id)
        end
      end
    end

    describe '#refund_transaction' do
      let(:gateway_id) { Faker::Lorem.word }
      let(:request_response) { Hash[*Faker::Lorem.words(4)].to_json }

      before do
        stub_request(:post, "#{described_class.base_uri}/transactions/#{gateway_id}/refund")
          .with(body: { api_key: api_key })
          .to_return(body: request_response, headers: { 'Content-Type' => 'application/json' })
      end

      it 'makes a post request to refund transaction and returns response' do
        response = subject.refund_transaction(gateway_id: gateway_id)

        expect(response).to be_success
        expect(response.body).to eq request_response
      end

      context 'when request is successfull' do
        it 'doesn`t capture message via Raven' do
          expect(Raven).to_not receive(:capture_message)

          subject.refund_transaction(gateway_id: gateway_id)
        end
      end

      context 'when request fails' do
        before do
          stub_request(:post, "#{described_class.base_uri}/transactions/#{gateway_id}/refund")
            .with(body: { api_key: api_key })
            .to_return(status: 500, body: request_response, headers: { 'Content-Type' => 'application/json' })
        end

        it 'captures message via Raven' do
          expect(Raven).to receive(:capture_message)
            .with('Transaction cannot be refunded on gateway', level: :fatal, extra: JSON.parse(request_response))

          subject.refund_transaction(gateway_id: gateway_id)
        end
      end
    end

    describe '#extract_credit_card_attributes' do
      let(:gateway_response) do
        {
          card: {
            country: 'UNITED STATES',
            expiration_date: '0220',
            id: 'gateway-card-id',
            holder_name: 'Holder Name',
            first_digits: '123456',
            last_digits: '7890',
            brand: 'Visa'
          }
        }
      end

      it 'returns credit card attributes extracted from gateway response' do
        credit_card_attributes = subject.extract_credit_card_attributes(gateway_response)

        expect(credit_card_attributes).to eq(
          gateway: 'pagarme',
          gateway_id: 'gateway-card-id',
          holder_name: 'Holder Name',
          first_digits: '123456',
          last_digits: '7890',
          country_code: 'US',
          brand: 'Visa',
          expires_on: '02/2020'.to_date,
          metadata: gateway_response
        )
      end
    end

    describe '#extract_bank_slip_attributes' do
      let(:gateway_response) do
        {
          boleto_barcode: '1234',
          boleto_url: 'http://example.com',
          boleto_expiration_date: '20/01/2020'
        }
      end

      it 'returns bank slip attributes extracted from gateway response' do
        bank_slip_attributes = subject.extract_bank_slip_attributes(gateway_response)

        expect(bank_slip_attributes).to eq(
          gateway: 'pagarme',
          barcode: '1234',
          url: 'http://example.com',
          expires_on: '20/01/2020'.to_date,
          metadata: gateway_response
        )
      end
    end
  end
end
