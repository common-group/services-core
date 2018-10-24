module CommonModels
  class SurveyQuestionChoice < ActiveRecord::Base
    self.table_name = 'project_service.survey_question_choices'
    belongs_to :survey_multiple_choice_question
  end
end
