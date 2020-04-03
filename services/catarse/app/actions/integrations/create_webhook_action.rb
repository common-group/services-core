module Integrations
  class CreateWebhookAction
    extend LightService::Action

    expects :provider
    expects :body
    expects :headers

    promises :webhook

    executed do |context|
      context.webhook = Integrations::Webhook.create!(
        provider: context.provider,
        body: context.body,
        headers: context.headers
      )
    end
  end
end
