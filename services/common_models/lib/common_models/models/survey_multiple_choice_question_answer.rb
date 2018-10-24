module CommonModels
  class SurveyMultipleChoiceQuestionAnswer < ActiveRecord::Base
    self.table_name = 'project_service.survey_multiple_choice_question_answers'
    belongs_to :survey_question_choice
    belongs_to :contribution
  end
end
