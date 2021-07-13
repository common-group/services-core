# frozen_string_literal: true

module Catarse
  module V2
    module Portal
      class AuthTokensAPI < Grape::API
        params do
          requires :credential, type: Hash do
            requires :email, type: String
            requires :password, type: String
          end
        end
        route_setting :auth, public: true
        post '/auth_tokens' do
          credential_params = declared(params)[:credential]
          result = ::Portal::AuthTokens::Generate.result(attributes: credential_params)

          if result.success?
            present :auth_token, result.auth_token
          else
            error!({ error: result.error }, 401)
          end
        end

        route_setting :auth, public: true
        get '/auth_tokens/me' do
          user = env['warden'].authenticate

          if user.present?
            auth_token = ::Portal::AuthToken.encode(payload: { user_id: user.id }, expires_at: 1.hour.from_now)
            present :auth_token, auth_token
          else
            error!({ error: 'Unauthorized' }, 401)
          end
        end
      end
    end
  end
end
