# frozen_string_literal: true

module Catarse
  module V2
    module Helpers
      module AuthenticationHelpers
        def authenticate_request!
          error!({ message: 'Unauthorized' }, 401) if current_user.nil?
        end

        def public_route?
          route.settings.try(:dig, :auth, :public)
        end

        def current_user
          @current_user ||= begin
            result = ::Portal::Users::AuthenticateByToken.result(authorization_header: headers['Authorization'])
            result.user if result.success?
          end
        end
      end
    end
  end
end
