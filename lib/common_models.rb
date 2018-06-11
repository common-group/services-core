require 'active_record'
require 'pg'
require 'logger'
require 'common_models/config'
require 'common_models/models/user'
require 'common_models/models/project'
require 'common_models/models/goal'


module CommonModels
  def self.extended(obj)
    ActiveRecord::Base.logger = Logger.new('debug.log')
    ActiveRecord::Base.establish_connection(@config)
  end
end
