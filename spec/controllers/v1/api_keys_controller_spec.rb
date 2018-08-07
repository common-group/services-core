# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::ApiKeysController, type: :controller do
  let!(:platform) { create(:platform) }
  let!(:another_platform) { create(:platform) }

  let(:user) { create(:user, platform: platform) }
  let(:another_user) { create(:user, platform: platform) }
  let(:another_platform_user) { create(:user, platform: another_platform) }

  let(:current_user) { user }
  let(:token_role) { 'scoped_user' }
  let(:platform_token) { platform.token }
  let(:user_id) { current_user.id }

  let(:policy_model_class) { CommonModels::UserApiKey.enabled }
  let(:policy_scope_class) { UserApiKeyPolicy::Scope }


  before do
    allow(controller).to receive(:decoded_api) do
      { user_id: user_id,
        role: token_role,
        platform_token: platform_token }.stringify_keys
    end
  end

  describe 'POST #create' do
    subject { response }

    context 'with anonymous' do
      include_examples 'with anonymous'
      before do
        post :create
      end
      it { is_expected.to have_http_status('403') }
    end

    context 'with platform_user from another platform' do
      include_examples 'with platform user from another platform'
      include_examples 'ensure policy scope usage'

      it do
        expect {
          post :create, params: { user: { id: user.id } }
        }.to raise_error(Pundit::NotAuthorizedError)
      end
    end

    context 'with platform_user from current_platform' do
      include_examples 'with platform user from current platform'
      include_examples 'ensure policy scope usage'

      before do
        post :create, params: { user_id: user.id }
      end

      it { is_expected.to have_http_status('200') }
      it 'should create a temp login api key' do
        json = JSON.parse(response.body)
        expect(CommonModels::UserApiKey.find(json['id']).present?).to eq(true)
      end
    end

    context 'with scoped_user' do
      include_examples 'ensure policy scope usage'

      before do
        post :create, params: { user_id: another_user.id }
      end

      it { is_expected.to have_http_status('200') }
      it do
        json = JSON.parse(response.body)
        resource = CommonModels::UserApiKey.find(json['id'])
        expect(resource.present?).to eq(true)
        expect(resource.user).to eq(user)
        expect(resource.user).to_not eq(another_user)
      end
    end
  end

  describe 'DELETE #destroy' do
    let(:api_key) { create(:user_api_key, user: user, platform: platform) }

    subject { response }

    context 'with anonymous' do
      include_examples 'with anonymous'
      before do
        delete :destroy, params: { id: api_key.id }
      end
      it { is_expected.to have_http_status('403') }
      it { expect(api_key.disabled_at.nil?).to eq(true) }
    end

    context 'with platform_user from another platform' do
      include_examples 'with platform user from another platform'
      include_examples 'ensure policy scope usage'

      it do
        expect do
          delete :destroy, params: { id: api_key.id }
        end.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with platform_user from current_platform' do
      include_examples 'with platform user from current platform'
      include_examples 'ensure policy scope usage'

      before do
        delete :destroy, params: { id: api_key.id }
        api_key.reload
      end

      it { is_expected.to have_http_status('200') }
      it { expect(api_key.disabled_at.nil?).to eq(false) }

      it do
        json = JSON.parse(response.body)
        expect(json['message']).to eq('api key disabled')
      end
    end

    context 'with scoped_user owner of key' do
      include_examples 'ensure policy scope usage'
      before do
        delete :destroy, params: { id: api_key.id }
        api_key.reload
      end

      it { is_expected.to have_http_status('200') }
      it { expect(api_key.disabled_at.nil?).to eq(false) }
      it do
        json = JSON.parse(response.body)
        expect(json['message']).to eq('api key disabled')
      end
    end
  end
end
