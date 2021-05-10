# frozen_string_literal: true

module Catarse
  module V2
    module Integrations
      class WebhooksAPI < Grape::API
        helpers do
          def webhook_params
            { provider: params[:provider], body: params, headers: headers }
          end
        end

        params do
          requires :provider, type: String, values: ::Integrations::WebhookProviders.list
        end

        post '/webhooks/:provider' do
          result = ::Integrations::Webhooks::Receive.result(attributes: webhook_params, raw_data: raw_request_body)

          if result.success?
            status :created
            present :status, 'ok'
          else
            status :internal_server_error
          end
        end
      end
    end
  end
end
