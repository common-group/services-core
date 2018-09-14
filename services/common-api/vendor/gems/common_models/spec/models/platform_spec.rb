# coding: utf-8
# frozen_string_literal: true

require 'spec_helper.rb'

RSpec.describe CommonModels::Platform, type: :model do
  describe 'associations' do
    it { is_expected.to have_many :users }
    it { is_expected.to have_many :projects }
    it { is_expected.to have_many :contributions }
    it { is_expected.to have_many :subscriptions }
    it { is_expected.to have_many :catalog_payments }
    it { is_expected.to have_many :platform_api_keys }
    it { is_expected.to have_many :user_api_keys }
    it { is_expected.to have_many :temp_login_api_keys }
  end

  describe 'validations' do
    %w[name token].each do |field|
      it { is_expected.to validate_presence_of field }
    end
  end
end
