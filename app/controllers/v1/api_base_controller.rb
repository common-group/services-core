module V1
  class ApiBaseController < ::ApplicationController
    def current_user
      @current_user ||= current_platform.users.find jwt_user_id
    end

    def current_platform
      @current_platform ||= CommonModels::Platform.find_by token: platform_token
    end

    def jwt_user_id
      decoded_api["user_id"]
    end

    def jwt_user_role
      decoded_api["role"].presence || 'anonymous'
    end

    def platform_token
      decoded_api['platform_token'].presence || request.headers['Platform-Code']
    end

    def authenticate_user!
      return render json: {
        message: 'missing Authorization header'
      }, status: 403 unless decoded_api.present? && current_user.present?
    end

    protected

    def decoded_api
      @decoded_api ||= JWT.decode(api_key, ENV['JWT_SECRET'], true, { algorithm: 'HS512' })[0] rescue nil
    end

    def api_key
      pattern = /^Bearer /
      header  = request.env["Authorization"]
      header.gsub(pattern, '') if header && header.match(pattern)
    end
  end
end
