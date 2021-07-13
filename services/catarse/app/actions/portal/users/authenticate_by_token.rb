# frozen_string_literal: true

module Portal
  module Users
    class AuthenticateByToken < Actor
      input :authorization_header, type: String, allow_nil: true

      output :user, type: [NilClass, User]

      def call
        auth_token = authorization_header.to_s.split.last
        fail!(error: 'Missing auth token') if auth_token.blank?
        payload = Portal::AuthToken.decode(auth_token: auth_token)
        self.user = User.find(payload.first['user_id'])
      rescue ActiveRecord::RecordNotFound, JWT::VerificationError, JWT::ExpiredSignature
        fail!(error: 'Invalid auth token')
      end
    end
  end
end
