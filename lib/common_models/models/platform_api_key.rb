# coding: utf-8
module CommonModels
  class PlatformApiKey < ActiveRecord::Base
    self.table_name = 'platform_service.platform_api_keys'
    belongs_to :platform

    validates :platform_id, :token, presence: true
  end
end
