module CommonModels
  class Subscription < ActiveRecord::Base
    self.table_name = 'payment_service.subscriptions'
    belongs_to :project
    belongs_to :user
  end
end
