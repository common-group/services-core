module CommonModels
  class Address < ActiveRecord::Base
    self.table_name = 'community_service.addresses'
    belongs_to :platform
    belongs_to :state
    belongs_to :country
    has_one :user, dependent: :nullify

    validates_presence_of :country, :state, :platform
  end
end
