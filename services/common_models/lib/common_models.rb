require 'active_record'
require 'pg'
require 'logger'
require 'common_models/config'
require 'common_models/models/platform'
require 'common_models/models/user'
require 'common_models/models/project'
require 'common_models/models/country'
require 'common_models/models/city'
require 'common_models/models/state'
require 'common_models/models/goal'
require 'common_models/models/report'
require 'common_models/models/post'
require 'common_models/models/direct_message'
require 'common_models/models/reward'
require 'common_models/models/subscription'
require 'common_models/models/notification'
require 'common_models/models/catalog_payment'
require 'common_models/models/shipping_fee'
require 'common_models/models/address'
require 'common_models/models/origin'
require 'common_models/models/contribution'
require 'common_models/models/platform_api_key'
require 'common_models/models/temp_login_api_key'
require 'common_models/models/user_api_key'
require 'common_models/models/user_role'


module CommonModels
  def self.extended(obj)
    ActiveRecord::Base.logger = Logger.new('debug.log')
    config = ENV['DATABASE_URL'].presence || @config
    ActiveRecord::Base.establish_connection(config)
  end
end
