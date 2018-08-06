# coding: utf-8
module CommonModels
  class TempLoginApiKey < ActiveRecord::Base
    self.table_name = 'community_service.temp_login_api_keys'
    belongs_to :platform
    belongs_to :user

    validates :platform_id, :user_id, :expires_at, :token, presence: true
  end
end
