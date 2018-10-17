# coding: utf-8
# frozen_string_literal: true

require 'spec_helper.rb'

RSpec.describe CommonModels::SurveyOpenQuestion, type: :model do
  describe 'Associations' do
    it { is_expected.to belong_to(:survey) }
  end
end
