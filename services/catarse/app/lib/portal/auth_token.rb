# frozen_string_literal: true

module Portal
  class AuthToken
    # TODO: Get JWT secret from vault

    def self.encode(payload:, expires_at:)
      payload['exp'] = expires_at.to_i
      JWT.encode(payload, CatarseSettings[:jwt_secret], 'HS256')
    end

    def self.decode(auth_token:)
      JWT.decode(auth_token, CatarseSettings[:jwt_secret], 'HS256')
    end
  end
end
