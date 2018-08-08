# frozen_string_literal: true

module V1
  module Users
    # SessionsController
    # Platform users can generate a temp login credential for a user
    # Anonymous can send email/password to generate a tem login credential
    class SessionsController < ApiBaseController
      before_action :authenticate_user!, only: :logout

      def login
        return render_already_signed_in if is_a_user_signed_in?

        find_cond = { email: permitted_attributes[:email] }
        find_cond = { id: permitted_attributes[:id] } if is_platform_user?

        user = current_platform.users.find_by! find_cond

        if !is_platform_user? &&
           user.password_hash != permitted_attributes[:password]
          return render_invalid_user
        end

        @resource = user.temp_login_api_keys.not_expired.last
        @resource = user.temp_login_api_keys.create!(
          platform_id: user.platform_id,
          token: CommonModels::TempLoginApiKey.gen_random_key,
          expires_at: 2.hours.from_now
        ) if @resource.nil?

        render json: { api_key: @resource.token }
      end

      def logout
        user = current_user
        user = current_platform.users.find permitted_attributes[:id] if is_platform_user?
        expireds = user.temp_login_api_keys.not_expired.map(&:expire!).compact
        render json: { message: "#{expireds.size} temp_login_api_keys expired" }
      end

      private

      def render_already_signed_in
        render json: {
          message: 'already signed'
        }, status: 401
      end

      def render_invalid_user
        render json: { message: 'invalid user or password' }, status: 403
      end

      def permitted_attributes
        params.require(:user).permit(policy(@resource).permitted_attributes)
      end

      def policy(record)
        TempLoginApiKeyPolicy.new(current_user, record)
      end
    end
  end
end
