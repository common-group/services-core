module CommonModels
  class Platform < ActiveRecord::Base
    self.table_name = 'platform_service.platforms'
    #store_accessor :data, FIELDS
    #validates_presence_of FIELDS
    validates :name, presence: true
  end
end
