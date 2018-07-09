module CommonModels
  class Reward < ActiveRecord::Base
    self.table_name = 'project_service.rewards'
    belongs_to :project
  end
end
