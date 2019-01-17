module V1
  class ApiBaseController < ::ApplicationController
    include Pundit

    def current_user
      return current_platform if is_platform_user?
      current_platform.users.find_by(id: jwt_user_id)
    end

    def is_a_user_signed_in?
      @is_a_user_signed_in ||= !is_platform_user? && current_user.present?
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

    def is_platform_user?
      jwt_role == 'platform_user'
    end

    def is_admin?
      user_role = current_platform.user_roles.find_by_user_id jwt_user_id
      role_name = user_role.try(:[], :role_name)
      role_name == 'admin'
    end

    protected

    def decoded_api
      @decoded_api ||= JWT.decode(api_key, ENV['JWT_SECRET'], true, { algorithm: 'HS256' })[0] if api_key.present?
    end

    def api_key
      pattern = /^Bearer /
      header  = request.headers["Authorization"]
      header.gsub(pattern, '') if header && header.match(pattern)
    end
  end
end
