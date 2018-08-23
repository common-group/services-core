# coding: utf-8
# frozen_string_literal: true

require 'spec_helper.rb'

RSpec.describe CommonModels::Address, type: :model do
  describe 'Associations' do
    it { is_expected.to belong_to(:platform) }
    it { is_expected.to belong_to(:state) }
    it { is_expected.to belong_to(:country) }
    it { is_expected.to have_one(:user) }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:country) }
    it { is_expected.to validate_presence_of(:state) }
    it { is_expected.to validate_presence_of(:platform) }
  end
end
