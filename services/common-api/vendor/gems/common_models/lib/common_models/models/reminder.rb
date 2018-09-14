module CommonModels
  class Reminder < ActiveRecord::Base
    self.table_name = 'project_service.reminders'
    belongs_to :project
    belongs_to :user
  end
end
