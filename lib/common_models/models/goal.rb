module CommonModels
  class Goal < ActiveRecord::Base
    self.table_name = 'project_service.goals'

    belongs_to :project
  end
end
