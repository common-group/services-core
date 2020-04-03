module Billing
  module Concerns
    module PaymentRequestStateMachine
      extend ActiveSupport::Concern

      included do
        include AASM

        after_create :create_state_transition

        aasm column: :state do
          state :created, initial: true
          state :waiting_payment
          state :authorized
          state :approved_on_antifraud
          state :declined_on_antifraud
          state :waiting_review
          state :paid
          state :overdue
          state :refused
          state :refunded
          state :chargedback

          after_all_transitions :create_state_transition

          event :authorize do
            transitions from: :created, to: :authorized, if: :credit_card?
          end

          event :wait_payment do
            transitions from: :created, to: :waiting_payment, if: :bank_slip?
          end

          event :approve do
            transitions from: :authorized, to: :approved_on_antifraud
          end

          event :decline do
            transitions from: :authorized, to: :declined_on_antifraud
          end

          event :wait_review do
            transitions from: :authorized, to: :waiting_review
          end

          event :settle do
            transitions from: :approved_on_antifraud, to: :paid
            transitions from: :authorized, to: :paid
            transitions from: :waiting_payment, to: :paid
            transitions from: :waiting_review, to: :paid
          end

          event :expire do
            transitions from: :waiting_payment, to: :overdue
          end

          event :refuse do
            transitions from: :created, to: :refused
            transitions from: :declined_on_antifraud, to: :refused
            transitions from: :waiting_review, to: :refused
          end

          event :refund do
            transitions from: :paid, to: :refunded
          end

          event :chargeback do
            transitions from: :paid, to: :chargedback
          end
        end

        private

        def create_state_transition(options = {})
          state_transitions.create!(
            from_state: aasm.from_state,
            to_state: aasm.to_state || :created,
            event: aasm.current_event,
            metadata: options[:metadata] || {}
          )
        end
      end
    end
  end
end
