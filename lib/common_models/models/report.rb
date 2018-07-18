module CommonModels
  class Report < ActiveRecord::Base
    self.table_name = 'project_service.reports'
    belongs_to :project
    belongs_to :user
  end
end
