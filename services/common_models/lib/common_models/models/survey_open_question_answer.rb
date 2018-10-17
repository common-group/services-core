module CommonModels
  class SurveyOpenQuestionAnswer < ActiveRecord::Base
    self.table_name = 'project_service.survey_open_question_answers'
    belongs_to :survey_open_question
    belongs_to :contribution
  end
end
