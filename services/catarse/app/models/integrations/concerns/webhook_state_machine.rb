module Integrations
  module Concerns
    module WebhookStateMachine
      extend ActiveSupport::Concern

      included do
        include AASM

        after_create :create_state_transition

        aasm column: :state do
          state :received, initial: true
          state :processing
          state :processed
          state :failed
          state :ignored

          after_all_transitions :create_state_transition

          event :start_processing do
            transitions from: :received, to: :processing
            transitions from: :failed, to: :processing
          end

          event :finish_processing do
            transitions from: :processing, to: :processed
          end

          event :fail do
            transitions from: :received, to: :failed
            transitions from: :processing, to: :failed
          end

          event :ignore do
            transitions from: :received, to: :ignored
            transitions from: :failed, to: :ignored
          end
        end

        private

        def create_state_transition(options = {})
          state_transitions.create!(
            from_state: aasm.from_state,
            to_state: aasm.to_state || :received,
            event: aasm.current_event,
            description: options[:description],
            metadata: options[:metadata] || {}
          )
        end
      end
    end
  end
end
