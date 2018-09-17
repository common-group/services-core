# coding: utf-8
module CommonModels
  class TempLoginApiKey < ActiveRecord::Base
    self.table_name = 'community_service.temp_login_api_keys'
    belongs_to :platform
    belongs_to :user

    validates :platform_id, :user_id, :expires_at, :token, presence: true

    scope :not_expired, -> {
      where(
          "community_service.temp_login_api_keys.expires_at > ?",
          DateTime.now
      )
    }

    def self.gen_random_key
      "temp_login_api_key_#{SecureRandom.hex(50)}"
    end

    def expired?
      expires_at <= Time.now
    end

    def expire!
      update_attribute(:expires_at, Time.now)
    end
  end
end
