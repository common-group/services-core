require 'rails_helper'

RSpec.describe Billing::Antifraud::Konduto::WebhookSignatureValidator, type: :lib do
  describe 'Class methods' do
    describe '.valid?' do
      let(:api_key) { Faker::Lorem.word }
      let(:body) { { order_id: Faker::Lorem.word, timestamp: Faker::Lorem.word, status: Faker::Lorem.word } }
      let(:string) { "#{body[:order_id]}##{body[:timestamp]}##{body[:status]}" }

      before do
        allow(Billing::Antifraud::Konduto::Client).to receive(:api_key).and_return(api_key)
        body.merge!(signature: signature)
      end

      context 'when signature is valid' do
        let(:signature) { OpenSSL::HMAC.hexdigest('SHA256', api_key, string) }

        it 'returns true' do
          expect(described_class.valid?(body: body)).to be_truthy
        end
      end

      context 'when signature is invalid' do
        let(:signature) { 'FAKE SIGNATURE' }

        it 'returns false' do
          expect(described_class.valid?(body: body)).to be_falsey
        end
      end
    end
  end
end
