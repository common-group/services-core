# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::Billing::CreditCardsAPI, type: :api do
  mock_request_authentication

  include_examples 'authenticate routes'

  describe 'POST /v2/billing/credit_cards' do
    let(:credit_card) { build(:billing_credit_card, user: create(:user)) }
    let(:credit_card_params) do
      {
        'hash' => Faker::Lorem.word,
        'billing_address_id' => Faker::Number.number,
        'saved' => Faker::Boolean.boolean
      }
    end

    before do
      allow(Billing::CreditCards::CreateOrUpdate).to receive(:result)
        .with(user: current_user, attributes: credit_card_params)
        .and_return(ServiceActor::Result.new(credit_card: credit_card))
    end

    it 'returns created/updated credit_card' do
      post '/api/v2/billing/credit_cards', params: { credit_card: credit_card_params }
      expected_response = { credit_card: Billing::CreditCardEntity.represent(credit_card) }.to_json

      expect(response.body).to eq(expected_response)
    end

    it 'return status 201 - created' do
      post '/api/v2/billing/credit_cards', params: { credit_card: credit_card_params }

      expect(response).to have_http_status(:created)
    end
  end
end
