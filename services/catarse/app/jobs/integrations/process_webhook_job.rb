# frozen_string_literal: true

module Integrations
  class ProcessWebhookJob < ApplicationJob
    def perform(webhook_id)
      webhook = Integrations::Webhook.find(webhook_id)
      processor = webhook.processor
      processor.run
    rescue StandardError => e
      Sentry.capture_exception(e, level: :fatal, extra: { webhook_id: webhook_id })
    end
  end
end
