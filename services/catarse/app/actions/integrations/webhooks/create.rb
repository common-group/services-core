# frozen_string_literal: true

module Integrations
  module Webhooks
    class Create < Actor
      input :attributes, type: Hash

      output :webhook, type: Integrations::Webhook

      def call
        initial_state = Integrations::WebhookStateMachine.initial_state
        self.webhook = Integrations::Webhook.create!(attributes.merge(state: initial_state))
      end
    end
  end
end
