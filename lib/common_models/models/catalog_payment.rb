module CommonModels
  class CatalogPayment < ActiveRecord::Base
    self.table_name = 'payment_service.catalog_payments'
    belongs_to :platform
    belongs_to :project
    belongs_to :user
    belongs_to :subscription
    belongs_to :contribution
    belongs_to :reward
  end
end
