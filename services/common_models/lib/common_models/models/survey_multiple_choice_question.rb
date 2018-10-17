module CommonModels
  class SurveyMultipleChoiceQuestion < ActiveRecord::Base
    self.table_name = 'project_service.survey_multiple_choice_questions'
    belongs_to :survey
    has_many :survey_question_choices
  end
end
