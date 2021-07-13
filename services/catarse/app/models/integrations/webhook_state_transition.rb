# frozen_string_literal: true

module Integrations
  class WebhookStateTransition < ApplicationRecord
    belongs_to :webhook, class_name: 'Integrations::Webhook', inverse_of: :state_transitions

    after_destroy :update_most_recent, if: :most_recent?

    private

    def update_most_recent
      last_transition = webhook.webhook_state_transitions.order(:sort_key).last
      return if last_transition.blank?

      last_transition.update(most_recent: true)
    end
  end
end
