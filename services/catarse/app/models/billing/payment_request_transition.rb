module Billing
  class PaymentRequestTransition < ActiveRecord::Base
    belongs_to :payment_request, inverse_of: :transitions, class_name: 'Billing::PaymentRequest'

    validates :to_state, inclusion: { in: PaymentRequestStateMachine.states }

    after_destroy :update_most_recent, if: :most_recent?

    private

    def update_most_recent
      last_transition = payment_request.transitions.order(:sort_key).last
      return unless last_transition.present?
      last_transition.update_column(:most_recent, true)
    end
  end
end
