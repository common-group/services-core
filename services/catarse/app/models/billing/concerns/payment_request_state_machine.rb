module Billing
  module Concerns
    module PaymentRequestStateMachine
      extend ActiveSupport::Concern

      included do
        include AASM

        after_create :create_state_transition

        aasm column: :state do
          state :waiting_payment, initial: true
          state :paid
          state :overdue
          state :refused
          state :refunded

          after_all_transitions :create_state_transition

          event :settle do
            transitions from: :waiting_payment, to: :paid
          end

          event :expire do
            transitions from: :waiting_payment, to: :overdue
          end

          event :refuse do
            transitions from: :waiting_payment, to: :refused
          end

          event :refund do
            transitions from: :paid, to: :refunded
          end
        end

        private

        def create_state_transition
          state_transitions.create!(
            from_state: aasm.from_state,
            to_state: aasm.to_state || :waiting_payment,
            event: aasm.current_event
          )
        end
      end
    end
  end
end
