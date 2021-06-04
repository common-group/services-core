# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::Portal::AuthTokensAPI do
  include_examples 'authenticate routes', public_paths: [
    'POST /v2/portal/auth_tokens',
    'GET /v2/portal/auth_tokens/me'
  ]

  describe 'POST /v2/portal/auth_tokens' do
    let(:auth_token) { Faker::Lorem.word }
    let(:credential_params) { attributes_for(:user).slice(:email, :password).stringify_keys }

    context 'when credential is valid' do
      before do
        allow(Portal::AuthTokens::Generate).to receive(:result)
          .with(attributes: credential_params)
          .and_return(ServiceActor::Result.new(auth_token: auth_token))
      end

      it 'returns http status CREATED' do
        post '/api/v2/portal/auth_tokens', params: { credential: credential_params }

        expect(response).to have_http_status(:created)
      end

      it 'renders generated auth token' do
        post '/api/v2/portal/auth_tokens', params: { credential: credential_params }

        expect(response.body).to eq({ auth_token: auth_token }.to_json)
      end
    end

    context 'when credential is invalid' do
      let(:error_message) { Faker::Lorem.paragraph }

      before do
        allow(Portal::AuthTokens::Generate).to receive(:result)
          .with(attributes: credential_params)
          .and_return(ServiceActor::Result.new(failure?: true, error: error_message))
      end

      it 'returns http status UNAUTHORIZED' do
        post '/api/v2/portal/auth_tokens', params: { credential: credential_params }

        expect(response).to have_http_status(:unauthorized)
      end

      it 'renders error message' do
        post '/api/v2/portal/auth_tokens', params: { credential: credential_params }

        expect(response.body).to eq({ error: error_message }.to_json)
      end
    end
  end

  describe 'GET /v2/portal/auth_tokens/me' do
    let(:user) { build(:user, id: Faker::Internet.uuid) }
    let(:warden) { instance_double('Warden::Proxy', authenticate: user) }

    context 'when warden has user authenticated' do
      before do
        Grape::Endpoint.before_each do |endpoint|
          allow(endpoint.env).to receive(:[]).with(any_args).and_call_original
          allow(endpoint.env).to receive(:[]).with('warden').and_return(warden)
        end
      end

      after do
        Grape::Endpoint.before_each nil
      end

      it 'returns http status OK' do
        get '/api/v2/portal/auth_tokens/me'

        expect(response).to have_http_status(:ok)
      end

      it 'renders generated auth token' do
        get '/api/v2/portal/auth_tokens/me'
        parsed_response = JSON.parse(response.body)
        payload = Portal::AuthToken.decode(auth_token: parsed_response['auth_token'])

        expect(payload.first['user_id']).to eq user.id
      end
    end

    context 'when warden hasn`t user authenticated' do
      it 'returns http status UNAUTHORIZED' do
        get '/api/v2/portal/auth_tokens/me'

        expect(response).to have_http_status(:unauthorized)
      end

      it 'renders generated auth token' do
        get '/api/v2/portal/auth_tokens/me'

        expect(response.body).to eq({ error: 'Unauthorized' }.to_json)
      end
    end
  end
end
