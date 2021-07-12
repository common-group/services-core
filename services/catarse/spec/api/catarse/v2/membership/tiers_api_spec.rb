# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::Membership::TiersAPI, type: :api do
  mock_request_authentication

  include_examples 'authenticate routes'

  describe 'GET /v2/membership/tiers' do
    let(:tiers) { build_list(:membership_tier, 5) }
    let(:project_id) { Faker::Internet.uuid }

    before do
      allow(Membership::Tiers::List).to receive(:result)
        .with(project_id: project_id)
        .and_return(ServiceActor::Result.new(tiers: tiers))
    end

    it 'returns project tiers' do
      get '/api/v2/membership/tiers', params: { project_id: project_id }
      expected_response = { tiers: Membership::TierEntity.represent(tiers) }.to_json

      expect(response.body).to eq expected_response
    end

    it 'return status 200 - ok' do
      get '/api/v2/membership/tiers', params: { project_id: project_id }

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST /v2/membership/tiers' do
    let(:tier) { build(:membership_tier) }
    let(:tier_params) do
      attributes_for(:membership_tier, project_id: '123').slice(:project_id, :name, :description).stringify_keys
    end

    before do
      allow(Membership::Tiers::Create).to receive(:result)
        .with(attributes: tier_params)
        .and_return(ServiceActor::Result.new(tier: tier))
    end

    it 'returns created tier' do
      post '/api/v2/membership/tiers', params: { tier: tier_params }
      expected_response = { tier: Membership::TierEntity.represent(tier) }.to_json

      expect(response.body).to eq expected_response
    end

    it 'return status 201 - created' do
      post '/api/v2/membership/tiers', params: { tier: tier_params }

      expect(response).to have_http_status(:created)
    end
  end

  describe 'PUT /v2/membership/tiers/:id' do
    let(:tier) { create(:membership_tier) }
    let(:tier_params) { attributes_for(:membership_tier).slice(:name, :description).stringify_keys }

    before do
      allow(Membership::Tiers::Update).to receive(:result)
        .with(id: tier.id, attributes: tier_params)
        .and_return(ServiceActor::Result.new(tier: tier))
    end

    it 'returns updated tier' do
      put "/api/v2/membership/tiers/#{tier.id}", params: { tier: tier_params }
      expected_response = { tier: Membership::TierEntity.represent(tier) }.to_json

      expect(response.body).to eq expected_response
    end

    it 'return status 200 - ok' do
      put "/api/v2/membership/tiers/#{tier.id}", params: { tier: tier_params }

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'DELETE /v2/membership/tiers/:id' do
    let(:tier) { create(:membership_tier) }

    before do
      allow(Membership::Tiers::Destroy).to receive(:result)
        .with(id: tier.id)
        .and_return(ServiceActor::Result.new(tier: tier))
    end

    it 'return status 204 - no_content' do
      delete "/api/v2/membership/tiers/#{tier.id}"

      expect(response).to have_http_status(:no_content)
    end
  end
end
