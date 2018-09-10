# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::DirectMessagesController, type: :controller do
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

  describe 'POST #create' do
    let(:direct_message) { build(:direct_message, to_user_id: current_user.id, platform: platform) }

    subject { response }

    context 'with anonymous' do
      before do
        allow(controller).to receive(:decoded_api).and_return(nil)
        allow(controller).to receive(:platform_token).and_return(platform.token)

        post :create, params: { direct_message: direct_message.attributes }
      end

      it { is_expected.to have_http_status('403') }
    end

    context 'with platform_user from current_platform' do
      let(:token_role) { 'platform_user' }
      let(:user_id) { nil }

      before do
        post :create, params: { direct_message: direct_message.attributes }
      end

      it { is_expected.to have_http_status('200') }
      it 'should create a new direct_message' do
        json = JSON.parse(response.body)
        expect(CommonModels::DirectMessage.find(json['direct_message_id']).present?).to eq(true)
      end
    end
  end
end
