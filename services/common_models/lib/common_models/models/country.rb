module CommonModels
  class Country < ActiveRecord::Base
    self.table_name = 'information_service.countries'
    belongs_to :platform
    validates_presence_of :name
  end
end
