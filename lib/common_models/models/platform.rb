module CommonModels
  class Platform < ActiveRecord::Base
    self.table_name = 'platform_service.platforms'
    has_many :users
    has_many :projects
    has_many :subscriptions
    has_many :catalog_payments

    #store_accessor :data, FIELDS
    #validates_presence_of FIELDS
    validates :name, :token, presence: true
  end
end
