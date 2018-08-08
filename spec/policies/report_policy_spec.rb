# coding: utf-8
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportPolicy do
  subject { described_class }
  let(:platform) { create(:platform) }
  let(:owner_one) { create(:user, platform: platform) }
  let(:owner_two) { create(:user, platform: platform) }
  let!(:project) { create(:project, platform: platform, user: owner_one) }
  let!(:another_project) { create(:project, platform: platform, user: owner_two) }
  let!(:another_user) { create(:user) }
  let!(:report) { build(:report, project: project, user: owner_two) }

  permissions :create? do
    it "denies when user from another platform" do
      expect(subject).to_not permit(another_user, report)
    end

    it "denies when comming from another platform platform_user" do
      expect(subject).to_not permit(another_user.platform, report)
    end

    it "permit when user is from same platform" do
      expect(subject).to permit(owner_one, report)
    end

    it "permit when platform_user is from current platform" do
      expect(subject).to permit(platform, report)
    end
  end

  describe 'strong parameters' do
    describe 'permitted_attributes' do
      subject { described_class.new(report.user, report).permitted_attributes }

      it { is_expected.to include(:reason) }
      it { is_expected.to include(:email) }
      it { is_expected.to include(:details) }
      it { is_expected.to include(:data) }
    end
  end
end
