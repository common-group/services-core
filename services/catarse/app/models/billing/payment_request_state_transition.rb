module Billing
  class PaymentRequestStateTransition < ActiveRecord::Base
    belongs_to :payment_request, inverse_of: :state_transitions, class_name: 'Billing::PaymentRequest'

    validates :payment_request_id, presence: true

    validates :to_state, inclusion: { in: Billing::PaymentRequest.aasm.states.map(&:name) }
    validates :from_state, inclusion: { in: Billing::PaymentRequest.aasm.states.map(&:name), allow_nil: true }
  end
end
