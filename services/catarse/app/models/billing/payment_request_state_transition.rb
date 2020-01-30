module Billing
  class PaymentRequestStateTransition < ActiveRecord::Base
    belongs_to :payment_request, inverse_of: :state_transitions, class_name: 'Billing::PaymentRequest'

    # validates :to_state, inclusion: { in: PaymentRequestStateMachine.states }
  end
end
