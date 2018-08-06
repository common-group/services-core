# coding: utf-8
# frozen_string_literal: true

require 'spec_helper.rb'

RSpec.describe CommonModels::PlatformApiKey, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to :platform }
  end

  describe 'validations' do
    %w[token platform_id].each do |field|
      it { is_expected.to validate_presence_of field }
    end
  end

  describe 'gen_random_key' do
    subject { CommonModels::PlatformApiKey.gen_random_key }
    it { is_expected.to match(/^platform_api_key_(\w+){0,50}/) }
  end
end
