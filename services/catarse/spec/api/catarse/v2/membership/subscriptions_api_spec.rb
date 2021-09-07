# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::Membership::SubscriptionsAPI, type: :api do
  mock_request_authentication

  include_examples 'authenticate routes'

  describe 'POST /v2/membership/subscriptions' do
    let(:subscription) { build(:membership_subscription) }
    let(:subscription_params) { { billing_option_id: Faker::Number.number, amount_cents: Faker::Number.number } }

    before do
      allow(Membership::Subscriptions::Create).to receive(:result)
        .with(user: current_user, attributes: subscription_params)
        .and_return(ServiceActor::Result.new(subscription: subscription))
    end

    it 'returns created subscription' do
      post '/api/v2/membership/subscriptions', params: { subscription: subscription_params }
      expected_response = { subscription: Membership::SubscriptionEntity.represent(subscription) }.to_json

      expect(response.body).to eq expected_response
    end

    it 'return status 201 - created' do
      post '/api/v2/membership/subscriptions', params: { subscription: subscription_params }

      expect(response).to have_http_status(:created)
    end
  end
end
