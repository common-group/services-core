module CommonModels
  class DirectMessage < ActiveRecord::Base

    self.table_name = 'community_service.direct_messages'
    belongs_to :platform
    belongs_to :project
    belongs_to :user
    validates_presence_of :platform, :to_user_id
  end
end
