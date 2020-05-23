require 'omniauth'
require 'omniauth-oauth2'
require 'pp'

module OmniAuth
  module Strategies
    class Bundle < OmniAuth::Strategies::OAuth2
      # Give your strategy a name.
      option :name, "bundle"

      # This is where you pass the options you would pass when
      # initializing your consumer from the OAuth gem.
      option :client_options, {
        :site => ENV['BUNDLE_SITE_URL'],
        :authorize_url => ENV['BUNDLE_AUTHORIZE_URL'],
        :token_url => 'http://local.bundlesites.com/oauth/token',
        :auth_token_params => {
          redirect_uri: 'http://localhost:3000/auth/bundle/callback'
        },
        :auth_scheme => 'request_body',
        :ssl => false,
        :connection_opts => {
          :ssl => false
        }
      }

      # These are called after authentication has succeeded. If
      # possible, you should try to set the UID without making
      # additional calls (if the user id is returned with the token
      # or as a URI parameter). This may not be possible with all
      # providers.
      uid{ 
        puts pp request
        "000000001" 
      }

      info do
        {
          :email => 'john.holmes.dean@gmail.com'
        }
      end

    end
  end
end