module Integrations
  class WebhookStateTransition < ActiveRecord::Base
    belongs_to :webhook, inverse_of: :state_transitions, class_name: 'Integrations::Webhook'

    validates :webhook_id, presence: true

    validates :to_state, inclusion: { in: Integrations::Webhook.aasm.states.map(&:name).map(&:to_s) }
    validates :from_state, inclusion: { in: Integrations::Webhook.aasm.states.map(&:name).map(&:to_s), allow_nil: true }
  end
end
