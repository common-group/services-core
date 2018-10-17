# coding: utf-8
# frozen_string_literal: true

require 'spec_helper.rb'

RSpec.describe CommonModels::SurveyAddressAnswer, type: :model do
  describe 'Associations' do
    it { is_expected.to belong_to(:address) }
    it { is_expected.to belong_to(:contribution) }
  end
end
