module CommonModels
  class Project < ActiveRecord::Base
    self.table_name = 'project_service.projects'

    belongs_to :user
    has_many :goals, foreign_key: :project_id
  end
end
