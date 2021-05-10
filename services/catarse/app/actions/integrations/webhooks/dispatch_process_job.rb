# frozen_string_literal: true

module Integrations
  module Webhooks
    class DispatchProcessJob < Actor
      input :webhook, type: Integrations::Webhook

      def call
        Integrations::ProcessWebhookJob.perform_later(webhook.id)
      end
    end
  end
end
