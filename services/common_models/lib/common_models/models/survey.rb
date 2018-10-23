module CommonModels
  class Survey < ActiveRecord::Base
    self.table_name = 'project_service.surveys'
    belongs_to :reward
    has_many :survey_open_questions
    has_many :survey_multiple_choice_questions

    validates_presence_of :reward
  end
end
