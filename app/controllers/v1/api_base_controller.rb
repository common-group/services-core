module V1
  class ApiBaseController < ::ApplicationController
    include Pundit
    #after_action :verify_authorized

    def current_user
      @current_user ||= current_platform.users.find_by id: jwt_user_id
    end

    def current_platform_user
      return if jwt_role != 'platform_user'
      @current_platform_user ||= CommonModels::Platform.find_by token: platform_token
    end

    def current_platform
      @current_platform ||= CommonModels::Platform.find_by token: platform_token
    end

    def jwt_user_id
      decoded_api.try(:[], 'user_id')
    end

    def jwt_role
      decoded_api.try(:[], 'role').presence || 'anonymous'
    end

    def platform_token
      return decoded_api['platform_token'] if decoded_api.present?
      return request.headers['Platform-Code']
    end

    def authenticate_user!
      return render json: {
        message: 'missing Authorization header'
      }, status: 403 unless decoded_api.present?
    end

    protected

    def decoded_api
      @decoded_api ||= JWT.decode(api_key, ENV['JWT_SECRET'], true, { algorithm: 'HS256' })[0] #rescue nil
    end

    def api_key
      pattern = /^Bearer /
      header  = request.headers["Authorization"]
      header.gsub(pattern, '') if header && header.match(pattern)
    end
  end
end
