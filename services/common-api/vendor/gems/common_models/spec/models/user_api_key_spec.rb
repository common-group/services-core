# coding: utf-8
# frozen_string_literal: true

require 'spec_helper.rb'

RSpec.describe CommonModels::UserApiKey, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to :platform }
    it { is_expected.to belong_to :user }
  end

  describe 'validations' do
    %w[token platform_id user_id].each do |field|
      it { is_expected.to validate_presence_of field }
    end
  end

  describe 'gen_random_key' do
    subject { CommonModels::UserApiKey.gen_random_key }
    it { is_expected.to match(/^user_api_key_(\w+){0,50}/) }
  end

  describe '.enabled' do
    let!(:enabled) { create(:user_api_key) }
    let!(:enabled2) { create(:user_api_key) }
    let!(:disabled) { create(:user_api_key, disabled_at: Time.now) }
    let!(:disabled2) { create(:user_api_key, disabled_at: Time.now) }

    context 'should include only enabled user api keys' do
      subject { described_class.enabled }
      
      it { is_expected.to include(enabled) }
      it { is_expected.to include(enabled2) }
      it { is_expected.to_not include(disabled) }
      it { is_expected.to_not include(disabled2) }
    end
  end
end
