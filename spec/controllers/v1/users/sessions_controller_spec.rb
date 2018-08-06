# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::Users::SessionsController, type: :controller do
  let!(:platform) { create(:platform) }
  let!(:another_platform) { create(:platform) }

  let(:user) { create(:user, platform: platform) }
  let(:another_platform_user) { create(:user, platform: another_platform) }

  let(:current_user) { user }
  let(:token_role) { 'scoped_user' }
  let(:platform_token) { platform.token }
  let(:user_id) { current_user.id }

  before do
    allow(controller).to receive(:decoded_api) do
      { user_id: user_id,
        role: token_role,
        platform_token: platform_token }.stringify_keys
    end
  end

  describe 'POST #login' do
    let(:project) { create(:project, user_id: current_user.id, platform: platform) }

    subject { response }

    context 'with anonymous' do
      include_examples 'with anonymous'
      before do
        post :login, params: { user: { email: user.email, password: '123456' } }
      end
      it { is_expected.to have_http_status('200') }
      it 'should create a temp login api key' do
        json = JSON.parse(response.body)
        expect(CommonModels::TempLoginApiKey.find_by_token(json['api_key']).present?).to eq(true)
      end
    end

    context 'with platform_user from another platform' do
      include_examples 'with platform user from another platform'

      it do
        expect {
          post :login, params: { user: { id: user.id } }
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with platform_user from current_platform' do
      include_examples 'with platform user from current platform'

      before do
        post :login, params: { user: { id: user.id } }
      end

      it { is_expected.to have_http_status('200') }
      it 'should create a temp login api key' do
        json = JSON.parse(response.body)
        expect(CommonModels::TempLoginApiKey.find_by_token(json['api_key']).present?).to eq(true)
      end
    end

    context 'with scoped_user' do
      before do
        post :login, params: { user: { email: user.email, password: ''} }
      end

      it { is_expected.to have_http_status('401') }
      it 'should return error when already signed' do
        json = JSON.parse(response.body)
        expect(json['message']).to eq('already signed')
      end
    end
  end

  describe 'POST #logout' do
    let(:project) { create(:project, user_id: current_user.id, platform: platform) }
    let(:goal) { create(:goal, project: project) }
    let(:goal_params) { { title: 'changed_title', description: 'changed_description', value: 200 } }
    let!(:temp_key) { create(:temp_login_api_key, user: user, expires_at: 10.days.from_now ) }

    subject { response }

    context 'with anonymous' do
      include_examples 'with anonymous'
      before do
        post :logout
      end
      it { is_expected.to have_http_status('403') }
    end

    context 'with platform_user from another platform' do
      include_examples 'with platform user from another platform'

      it do
        expect {
          post :logout, params: { user: { id: user.id } }
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with platform_user from current_platform' do
      include_examples 'with platform user from current platform'

      before do
        post :logout, params: { user: { id: user.id } }
      end

      it { is_expected.to have_http_status('200') }

      it 'should expire all temp api keys on user' do
        temp_key.reload
        expect(temp_key.expired?).to eq(true)
        json = JSON.parse(response.body)
        expect(json['message']).to eq('1 temp_login_api_keys expired')
      end
    end

    context 'with scoped_user' do
      before do
        post :logout
      end

      it { is_expected.to have_http_status('200') }

      it 'should expire all temp api keys on user' do
        temp_key.reload
        expect(temp_key.expired?).to eq(true)
        json = JSON.parse(response.body)
        expect(json['message']).to eq('1 temp_login_api_keys expired')
      end
    end
  end
end
