# frozen_string_literal: true

module V1
  module Users
    # SessionsController
    # Platform users can generate a temp login credential
    # Anonymous can send email/password to generate a tem login credential
    class SessionsController < ApiBaseController
      before_action :authenticate_user!, only: :logout

      # when platform_user should check if user is on platform { user: id }
      # when anonymous should check if user is present on platform before match password {user: [:email, :password]}
      def login
        #TODO: breakdown inside a service for session management & token revogation
        return render json: {
          message: 'already signed' 
        }, status: 401 if current_user.present?

        if current_platform_user.present?
          @user = current_platform_user.users.find permitted_attributes[:id]
        else
          @user = current_platform.users.find_by email: permitted_attributes[:email]
          return render json: { 
            message: 'invalid user or password' 
          }, status: 403 if @user.nil? || @user.password_hash != permitted_attributes[:password]
        end

        @resource = @user.temp_login_api_keys.not_expired.last
        @resource = @user.temp_login_api_keys.create!(
          platform_id: current_platform.id,
          token: CommonModels::TempLoginApiKey.gen_random_key,
          expires_at: 2.hours.from_now
        ) if @resource.nil?

        render json: { api_key: @resource.token }
      end

      def logout
        @user =
          if current_platform_user.present?
            current_platform_user.users.find(permitted_attributes[:id])
          else
            current_user
          end

        expireds = @user.temp_login_api_keys.not_expired.map(&:expire!).compact
        render json: { message: "#{expireds.size} temp_login_api_keys expired" }
      end

      private

      def permitted_attributes
        params.require(:user).permit(%i[id email password])
      end

      #def policy(record)
      #  TempLoginApiKeyPolicy.new((current_user.presence||current_platform_user.presence), record)
      #end

      #def pundit_params_for(record)
      #  params.require(:user)
      #end
    end
  end
end
