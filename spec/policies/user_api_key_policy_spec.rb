# coding: utf-8
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserApiKeyPolicy do
  subject { described_class }
  let(:platform) { create(:platform) }
  let(:keyowner_one) { create(:user, platform: platform) }
  let(:keyowner_two) { create(:user, platform: platform) }
  let!(:api_key) { create(:user_api_key, platform: platform, user: keyowner_one) }
  let!(:another_api_key) { create(:user_api_key, platform: platform, user: keyowner_two) }
  let!(:another_user) { create(:user) }

  permissions :create?, :destroy? do
    it "denies when user is not owner" do
      expect(subject).to_not permit(another_user, api_key)
    end

    it "permit when user is owner" do
      expect(subject).to permit(api_key.user, api_key)
    end

    it "denies when comming from another platform platform_user" do
      expect(subject).to_not permit(another_user.platform, api_key)
    end

    it "permit when platform_user is from current platform" do
      expect(subject).to permit(api_key.platform, api_key)
    end
  end

  describe 'scopes' do
    let(:resolved_scope) do
      described_class::Scope.new(user, CommonModels::UserApiKey.all).resolve
    end

    context 'with user' do
      context 'when user is owner of some api key' do
        let(:user) { api_key.user }

        subject { resolved_scope }

        it { is_expected.to include(api_key) }
        it { is_expected.to_not include(another_api_key) }
      end

      context 'when user does not have any api key' do
        let(:user) { another_user }

        subject { resolved_scope }

        it { is_expected.to_not include(api_key) }
        it { is_expected.to_not include(another_api_key) }
      end
    end

    context 'with platform user' do
      context 'when platform not have any user with api keys' do
        let(:user) { another_user.platform }

        subject { resolved_scope }

        it { is_expected.to_not include(api_key) }
        it { is_expected.to_not include(another_api_key) }
      end

      context 'when platform have user with api keys' do
        let(:user) { platform }

        subject { resolved_scope }

        it { is_expected.to include(api_key) }
        it { is_expected.to include(another_api_key) }
      end
    end
  end
end
