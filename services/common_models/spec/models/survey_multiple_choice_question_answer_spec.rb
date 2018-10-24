# coding: utf-8
# frozen_string_literal: true

require 'spec_helper.rb'

RSpec.describe CommonModels::SurveyMultipleChoiceQuestionAnswer, type: :model do
  describe 'Associations' do
    it { is_expected.to belong_to(:survey_question_choice) }
    it { is_expected.to belong_to(:contribution) }
  end
end
