module CommonModels
  class City < ActiveRecord::Base
    self.table_name = 'information_service.cities'
    belongs_to :state
    validates_presence_of :name
  end
end
