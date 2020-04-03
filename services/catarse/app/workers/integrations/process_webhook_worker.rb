module Integrations
  class ProcessWebhookWorker
    include Sidekiq::Worker

    sidekiq_options retry: false, queue: 'actions'

    def perform(webhook_id)
      webhook = Integrations::Webhook.find(webhook_id)

      processor = Integrations::Webhook::PROCESSORS[webhook.provider.to_s]

      processor.new(webhook).process!
    end
  end
end
