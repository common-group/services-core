# coding: utf-8
# frozen_string_literal: true

require 'spec_helper.rb'

RSpec.describe CommonModels::TempLoginApiKey, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to :platform }
    it { is_expected.to belong_to :user }
  end

  describe 'validations' do
    %w[token platform_id user_id expires_at].each do |field|
      it { is_expected.to validate_presence_of field }
    end
  end

  describe 'gen_random_key' do
    subject { CommonModels::TempLoginApiKey.gen_random_key }
    it { is_expected.to match(/^temp_login_api_key_(\w+){0,50}/) }
  end
end
