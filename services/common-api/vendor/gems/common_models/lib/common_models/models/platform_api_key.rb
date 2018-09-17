# coding: utf-8
module CommonModels
  class PlatformApiKey < ActiveRecord::Base
    self.table_name = 'platform_service.platform_api_keys'
    belongs_to :platform

    validates :platform_id, :token, presence: true

    def self.gen_random_key
      "platform_api_key_#{SecureRandom.hex(50)}"
    end
  end
end
