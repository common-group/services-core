module CommonModels
  class Cancelation < ActiveRecord::Base
    self.table_name = 'project_service.cancelations'
    belongs_to :project
  end
end
