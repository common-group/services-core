# frozen_string_literal: true

module Integrations
  class WebhookStateMachine
    include Statesman::Machine

    state :received, initial: true
    state :processing
    state :processed
    state :failed
    state :ignored

    transition from: :received, to: %i[processing failed ignored]
    transition from: :processing, to: %i[processed failed]
    transition from: :failed, to: %i[processing ignored]

    after_transition(after_commit: true) do |webhook, transition|
      webhook.update!(state: transition.to_state)
    end
  end
end
