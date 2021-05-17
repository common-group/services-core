# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::Billing::PaymentsAPI, type: :api do
  describe 'POST /v2/billing/payments' do
    let(:user) { create(:user) }
    let(:payment) { build(:billing_payment) }
    let(:payment_params) do
      {
        'payment_method' => payment.payment_method,
        'gateway' => payment.gateway,
        'billing_address_id' => Faker::Internet.uuid,
        'installments_count' => Faker::Number.number(digits: 1),
        'payables' => [
          { 'id' => 123, 'type' => 'Contribution' },
          { 'id' => 456, 'type' => 'Subscription' }
        ],
        credit_card_hash: Faker::Lorem.word
      }
    end

    before do
      allow(User).to receive(:last).and_return(user)
      allow(Billing::Payments::Checkout).to receive(:result)
        .with(user: user, attributes: payment_params)
        .and_return(ServiceActor::Result.new(payment: payment))
    end

    it 'returns processed payment' do
      post '/v2/billing/payments', params: { payment: payment_params }

      expect(response.body).to eq(payment.to_json)
    end

    it 'return status 201 - created' do
      post '/v2/billing/payments', params: { payment: payment_params }

      expect(response).to have_http_status(:created)
    end
  end
end
