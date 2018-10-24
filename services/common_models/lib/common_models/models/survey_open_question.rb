module CommonModels
  class SurveyOpenQuestion < ActiveRecord::Base
    self.table_name = 'project_service.survey_open_questions'
    belongs_to :survey
    has_many :survey_open_question_answers
  end
end
