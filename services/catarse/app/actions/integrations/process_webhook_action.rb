module Integrations
  class ProcessWebhookAction
    extend LightService::Action

    expects :webhook

    executed do |context|
      context.fail_and_return!('Webhook cannot be processed') unless context.webhook.may_start_processing?

      Integrations::ProcessWebhookWorker.perform_async(context.webhook.id)
    end
  end
end
