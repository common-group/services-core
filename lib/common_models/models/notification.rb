module CommonModels
  class Notification < ActiveRecord::Base
    self.table_name = 'notification_service.notifications'
    belongs_to :user
  end
end
