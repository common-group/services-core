# coding: utf-8
# frozen_string_literal: true

require 'spec_helper.rb'

RSpec.describe CommonModels::City, type: :model do
  describe 'Associations' do
    it { is_expected.to belong_to(:platform) }
    it { is_expected.to belong_to(:state) }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:name) }
  end
end
