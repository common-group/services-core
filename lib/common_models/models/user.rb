module CommonModels
  class User < ActiveRecord::Base
    self.table_name = 'community_service.users'

    has_many :projects
  end
end
