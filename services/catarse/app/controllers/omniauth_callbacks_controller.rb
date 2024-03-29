# frozen_string_literal: true

class OmniauthCallbacksController < Devise::OmniauthCallbacksController
  skip_before_action :set_locale

  def self.add_providers
    OauthProvider.all.each do |p|
      define_method p.name.downcase do
        omniauth = request.env['omniauth.auth'].deep_symbolize_keys
        unless (@auth = Authorization.find_from_hash(omniauth))
          user = current_user || (User.find_by_email(omniauth[:info][:email]) if omniauth[:info][:email])
          if omniauth[:info][:email]
            @auth = Authorization.create_from_hash(omniauth, user)
          else
            flash[:alert] = I18n.t('devise.omniauth_callbacks.failure', kind: p.name.capitalize, reason: 'email não foi informado')
            return redirect_to sign_up_path
          end
        end

        flash[:notice] = I18n.t('devise.omniauth_callbacks.success', kind: p.name.capitalize)
        @auth.update(last_token: omniauth[:credentials][:token])
        if omniauth[:provider] == 'facebook'
          FbFriendCollectorWorker.perform_async(@auth.id)
        end

        sign_in @auth.user, event: :authentication
        redirect_to after_sign_in_path_for(@auth.user)
      end
    end
  end
end
