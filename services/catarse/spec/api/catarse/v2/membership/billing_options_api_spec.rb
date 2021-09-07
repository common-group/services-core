# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::Membership::BillingOptionsAPI, type: :api do
  mock_request_authentication

  include_examples 'authenticate routes'

  describe 'GET /v2/membership/tiers/:tier_id/billing_options' do
    let(:billing_option) { create(:membership_billing_option) }

    before do
      allow(Membership::BillingOptions::List).to receive(:result)
        .with(tier_id: billing_option.tier_id)
        .and_return(ServiceActor::Result.new(billing_options: [billing_option]))
    end

    it 'returns tier`s billing options' do
      get "/api/v2/membership/tiers/#{billing_option.tier_id}/billing_options"
      expected_response = { billing_options: Membership::BillingOptionEntity.represent([billing_option]) }.to_json

      expect(response.body).to eq expected_response
    end

    it 'return status 200 - ok' do
      get "/api/v2/membership/tiers/#{billing_option.tier_id}/billing_options"

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST /v2/membership/tiers/:tier_id/billing_options' do
    let(:tier_id) { Faker::Number.number }
    let(:billing_option) { build(:membership_billing_option) }
    let(:billing_option_params) { billing_option.attributes.slice('cadence_in_months', 'amount_cents') }

    before do
      allow(Membership::BillingOptions::Create).to receive(:result)
        .with(tier_id: tier_id, attributes: billing_option_params)
        .and_return(ServiceActor::Result.new(billing_option: billing_option))
    end

    it 'returns created billing option' do
      post "/api/v2/membership/tiers/#{tier_id}/billing_options", params: { billing_option: billing_option_params }
      expected_response = { billing_option: Membership::BillingOptionEntity.represent(billing_option) }.to_json

      expect(response.body).to eq expected_response
    end

    it 'return status 201 - created' do
      post "/api/v2/membership/tiers/#{tier_id}/billing_options", params: { billing_option: billing_option_params }

      expect(response).to have_http_status(:created)
    end
  end

  describe 'PUT /v2/membership/billing_options/:id' do
    let(:billing_option) { create(:membership_billing_option) }
    let(:billing_option_params) { attributes_for(:membership_billing_option).slice(:enabled).stringify_keys }

    before do
      allow(Membership::BillingOptions::Update).to receive(:result)
        .with(id: billing_option.id, attributes: billing_option_params)
        .and_return(ServiceActor::Result.new(billing_option: billing_option))
    end

    it 'returns updated billing_option' do
      put "/api/v2/membership/billing_options/#{billing_option.id}", params: { billing_option: billing_option_params }
      expected_response = { billing_option: Membership::BillingOptionEntity.represent(billing_option) }.to_json

      expect(response.body).to eq expected_response
    end

    it 'return status 200 - ok' do
      put "/api/v2/membership/billing_options/#{billing_option.id}", params: { billing_option: billing_option_params }

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'DELETE /v2/membership/billing_options/:id' do
    let(:billing_option) { create(:membership_billing_option) }

    before do
      allow(Membership::BillingOptions::Destroy).to receive(:result)
        .with(id: billing_option.id)
        .and_return(ServiceActor::Result.new(billing_option: billing_option))
    end

    it 'return status 204 - no_content' do
      delete "/api/v2/membership/billing_options/#{billing_option.id}"

      expect(response).to have_http_status(:no_content)
    end
  end
end
