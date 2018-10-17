# coding: utf-8
# frozen_string_literal: true

require 'spec_helper.rb'

RSpec.describe CommonModels::Survey, type: :model do
  describe 'Associations' do
    it { is_expected.to belong_to(:reward) }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:reward) }
  end
end
