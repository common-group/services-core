require 'active_record'
require 'pg'
require 'logger'
require 'common_models/config'
require 'common_models/models/user'
require 'common_models/models/project'
require 'common_models/models/goal'
require 'common_models/models/reward'
require 'common_models/models/subscription'
require 'common_models/models/notification'
require 'common_models/models/catalog_payment'


module CommonModels
  def self.extended(obj)
    ActiveRecord::Base.logger = Logger.new('debug.log')
    ActiveRecord::Base.establish_connection(@config)
  end
end
