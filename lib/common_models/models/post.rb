module CommonModels
  class Post < ActiveRecord::Base
    self.table_name = 'project_service.posts'
    belongs_to :project
  end
end
