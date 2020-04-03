module Catarse
  module V2
    module Integrations
      class WebhooksAPI < Grape::API
        desc 'Receives a webhook'
        params do
          requires :provider, type: String, values: ::Integrations::Webhook.providers.values
        end

        post '/webhooks/:provider' do
          ::Integrations::ReceiveWebhook.call(
            provider: params[:provider],
            body: params,
            headers: headers,
            raw_data: raw_request_body
          )

          status :ok
          present :status, 'ok'
        end
      end
    end
  end
end
