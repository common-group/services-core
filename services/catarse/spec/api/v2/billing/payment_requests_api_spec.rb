require 'rails_helper'

RSpec.describe Catarse::V2::Billing::PaymentRequestsAPI, type: :api do
  describe 'POST /v2/billing/payment_requests' do
    let(:user) { double }
    let(:payment_request) { Billing::PaymentRequest.new }
    let(:params) do
      {
        payment_method: 'credit_card',
        installments_count: 2,
        gateway_card_hash: 'card_hash',
        billing_address: {
          zip_code: '60420000',
          country_id: 1,
          line_1: 'Rua A',
          line_2: 'AP 10',
          number: '125',
          neighborhood: 'Neighboorhood',
          city: 'City',
          state_id: '1',
          phone_number: '1234-1525s'
        },
        items: [
          { payable_id: 1, payable_type: 'Contribution' },
          { payable_id: 1, payable_type: 'Subscription' }
        ]
      }
    end

    before { allow(User).to receive(:last).and_return(user) }

    context 'when checkout is successful' do
      before do
        allow(Billing::ProcessCheckout).to receive(:call)
          .with(user: user, payment_request_attributes: params)
          .and_return(double(success?: true, payment_request: payment_request))
      end

      it 'has http status CREATED' do
        post '/v2/billing/payment_requests', payment_request: params

        expect(last_response.status).to eq Rack::Utils::SYMBOL_TO_STATUS_CODE[:created]
      end

      it 'renders newly created payment request' do
        post '/v2/billing/payment_requests', payment_request: params
        expected_response = { payment_request: Billing::PaymentRequestEntity.new(payment_request) }.to_json

        expect(last_response.body).to eq expected_response
      end
    end

    context 'when checkout is a failure' do
      before do
        allow(Billing::ProcessCheckout).to receive(:call)
          .with(user: user, payment_request_attributes: params)
          .and_return(double(success?: false, message: 'Some error', payment_request: payment_request))
      end

      it 'has http status UNPROCESSABLE_ENTITY' do
        post '/v2/billing/payment_requests', payment_request: params

        expect(last_response.status).to eq Rack::Utils::SYMBOL_TO_STATUS_CODE[:unprocessable_entity]
      end

      it 'renders error message' do
        post '/v2/billing/payment_requests', payment_request: params
        expected_response = {
          error: 'Some error',
          payment_request: Billing::PaymentRequestEntity.new(payment_request)
        }.to_json

        expect(last_response.body).to eq expected_response
      end
    end
  end
end
