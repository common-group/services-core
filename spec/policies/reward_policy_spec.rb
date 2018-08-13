# coding: utf-8
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RewardPolicy do
  subject { described_class }
  let(:platform) { create(:platform) }
  let(:owner_one) { create(:user, platform: platform) }
  let(:owner_two) { create(:user, platform: platform) }
  let!(:project) { create(:project, platform: platform, user: owner_one) }
  let!(:another_project) { create(:project, platform: platform, user: owner_two) }
  let!(:another_user) { create(:user) }
  let!(:reward) { build(:reward, project: project) }

  permissions :create? do
    it "denies when user from another platform" do
      expect(subject).to_not permit(another_user, reward)
    end

    it "denies when coming from another platform platform_user" do
      expect(subject).to_not permit(another_user.platform, reward)
    end

    it "permit when user is from same platform" do
      expect(subject).to permit(owner_one, reward)
    end

    it "permit when platform_user is from current platform" do
      expect(subject).to permit(platform, reward)
    end
  end

  describe 'strong parameters' do
    describe 'permitted_attributes' do
      subject { described_class.new(reward.project.user, reward).permitted_attributes }

      it { is_expected.to include(:project_id) }
      it { is_expected.to include(:data) }
    end
  end
end
