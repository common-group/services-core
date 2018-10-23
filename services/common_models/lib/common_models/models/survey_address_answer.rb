module CommonModels
  class SurveyAddressAnswer < ActiveRecord::Base
    self.table_name = 'project_service.survey_address_answers'
    belongs_to :address
    belongs_to :contribution
  end
end
