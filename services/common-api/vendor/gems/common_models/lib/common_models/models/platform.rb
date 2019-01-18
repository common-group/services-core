module CommonModels
  class Platform < ActiveRecord::Base
    self.table_name = 'platform_service.platforms'
    has_many :users
    has_many :projects
    has_many :contributions
    has_many :subscriptions
    has_many :catalog_payments
    has_many :platform_api_keys
    has_many :user_api_keys
    has_many :temp_login_api_keys
    has_many :user_roles

    #store_accessor :data, FIELDS
    #validates_presence_of FIELDS
    validates :name, :token, presence: true
  end
end
