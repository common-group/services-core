require 'rails_helper'

RSpec.describe Billing::Gateways::Pagarme::WebhookSignatureValidator, type: :lib do
  describe 'Class methods' do
    describe '.valid?' do
      let(:api_key) { Faker::Lorem.word }
      let(:headers) { { 'X-Hub-Signature' => signature } }
      let(:raw_data) { Faker::Lorem.paragraph }

      before do
        allow(Billing::Gateways::Pagarme::Client).to receive(:api_key).and_return(api_key)
      end

      context 'when signature is valid' do
        let(:signature) { "sha1=#{OpenSSL::HMAC.hexdigest('sha1', api_key, raw_data)}" }

        it 'returns true' do
          expect(described_class.valid?(headers: headers, raw_data: raw_data)).to be_truthy
        end
      end

      context 'when signature is invalid' do
        let(:signature) { 'sha1=FAKE SIGNATURE' }

        it 'returns false' do
          expect(described_class.valid?(headers: headers, raw_data: raw_data)).to be_falsey
        end
      end
    end
  end
end
