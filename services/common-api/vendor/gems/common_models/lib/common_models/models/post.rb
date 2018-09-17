module CommonModels
  class Post < ActiveRecord::Base
    self.table_name = 'project_service.posts'
    belongs_to :project

    validates_presence_of :title, :comment_html
  end
end
