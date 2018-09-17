# coding: utf-8
# frozen_string_literal: true

require 'spec_helper.rb'

RSpec.describe CommonModels::State, type: :model do
  describe 'Associations' do
    it { is_expected.to belong_to(:platform) }
    it { is_expected.to belong_to(:country) }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:acronym) }
  end
end
