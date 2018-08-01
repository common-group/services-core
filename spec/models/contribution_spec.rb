# coding: utf-8
# frozen_string_literal: true

require 'spec_helper.rb'
require "shoulda/matchers"

RSpec.describe CommonModels::Contribution, type: :model do
  describe 'Associations' do
    it { is_expected.to belong_to(:origin) }
    it { is_expected.to belong_to(:project) }
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:reward) }
    it { is_expected.to belong_to(:address) }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:project) }
    it { is_expected.to validate_presence_of(:user) }
    it { is_expected.to validate_presence_of(:value) }
    it { is_expected.to_not allow_value(9).for(:value) }
    it { is_expected.to allow_value(10).for(:value) }
    it { is_expected.to allow_value(20).for(:value) }
  end
end
