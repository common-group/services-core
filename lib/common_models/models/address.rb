module CommonModels
  class Address < ActiveRecord::Base
    self.table_name = 'community_service.addresses'
    belongs_to :state
    belongs_to :country
  end
end
