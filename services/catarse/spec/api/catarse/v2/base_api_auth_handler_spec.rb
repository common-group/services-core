# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::BaseAPI, type: :api do
  subject(:api) { Class.new(described_class) }

  def app
    subject
  end

  let(:headers) { { 'Authorization' => 'Bearer token.here' } }
  let(:user) { build(:user, id: Faker::Number.number) }

  before do
    api.route_setting :auth, public: true
    api.get '/public' do
      { public: public_route?, user_id: current_user.try(:id) }
    end

    api.get '/implicit_private' do
      { public: public_route?, user_id: current_user.try(:id) }
    end

    api.route_setting :auth, public: false
    api.get '/explicit_private' do
      { public: public_route?, user_id: current_user.try(:id) }
    end
  end

  context 'when endpoint is public' do
    it 'doesn`t authenticate request' do
      get '/v2/public'

      expect(response).to have_http_status(:ok)
    end
  end

  context 'when route requires authentication' do
    context 'when auth token is valid' do
      before do
        allow(Portal::Users::AuthenticateByToken).to receive(:result)
          .with(authorization_header: headers['Authorization'])
          .and_return(ServiceActor::Result.new(failure?: false, user: user))
      end

      it 'authorizes request' do
        get '/v2/implicit_private', headers: headers

        expect(response).to have_http_status(:ok)
      end
    end

    context 'when auth token is invalid' do
      before do
        allow(Portal::Users::AuthenticateByToken).to receive(:result)
          .with(authorization_header: headers['Authorization'])
          .and_return(ServiceActor::Result.new(failure?: true))
      end

      it 'unauthorizes request' do
        get '/v2/implicit_private', headers: headers

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe '#public_route?' do
    before do
      allow(Portal::Users::AuthenticateByToken).to receive(:result)
        .with(authorization_header: headers['Authorization'])
        .and_return(ServiceActor::Result.new(failure?: false, user: user))
    end

    context 'when route setting auth.public is true' do
      it 'returns true' do
        get '/v2/public', headers: headers

        expect(JSON.parse(response.body)).to include({ 'public' => true })
      end
    end

    context 'when route setting auth.public is false' do
      it 'returns false' do
        get '/v2/explicit_private', headers: headers

        expect(JSON.parse(response.body)).to include({ 'public' => false })
      end
    end

    context 'when route setting auth.public is not defined' do
      it 'returns false' do
        get '/v2/implicit_private', headers: headers

        expect(JSON.parse(response.body)).to include({ 'public' => nil })
      end
    end
  end

  describe '#current_user' do
    context 'when auth token is valid' do
      before do
        allow(Portal::Users::AuthenticateByToken).to receive(:result)
          .with(authorization_header: headers['Authorization'])
          .and_return(ServiceActor::Result.new(failure?: false, user: user))
      end

      it 'returns signed in user' do
        get '/v2/public', headers: headers

        expect(JSON.parse(response.body)).to include({ 'user_id' => user.id })
      end
    end

    context 'when auth token is invalid' do
      before do
        allow(Portal::Users::AuthenticateByToken).to receive(:result)
          .with(authorization_header: headers['Authorization'])
          .and_return(ServiceActor::Result.new(failure?: true))
      end

      it 'returns nil' do
        get '/v2/public', headers: headers

        expect(JSON.parse(response.body)).to include({ 'user_id' => nil })
      end
    end
  end
end
