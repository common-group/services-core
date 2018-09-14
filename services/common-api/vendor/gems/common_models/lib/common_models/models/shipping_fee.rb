module CommonModels
  class ShippingFee < ActiveRecord::Base
    self.table_name = 'project_service.shipping_fees'
    belongs_to :reward
    validates_presence_of :value, :destination
  end
end
