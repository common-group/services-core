# coding: utf-8
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SubscriptionPolicy do
  subject { described_class }
  let(:platform) { create(:platform) }
  let(:owner_one) { create(:user, platform: platform) }
  let(:owner_two) { create(:user, platform: platform) }
  let!(:project) { create(:project, platform: platform, user: owner_one) }
  let!(:another_project) { create(:project, platform: platform, user: owner_two) }
  let!(:another_user) { create(:user) }
  let!(:reward) { build(:reward, project: project) }

  context 'permissions' do
    pending 'pending'
  end
end
