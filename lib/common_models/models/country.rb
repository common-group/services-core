module CommonModels
  class Country < ActiveRecord::Base
    self.table_name = 'information_service.countries'
    validates_presence_of :name
  end
end
