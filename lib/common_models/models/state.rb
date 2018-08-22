module CommonModels
  class State < ActiveRecord::Base
    self.table_name = 'information_service.states'
    belongs_to :platform
    belongs_to :country
    validates_presence_of :name, :acronym
  end
end
