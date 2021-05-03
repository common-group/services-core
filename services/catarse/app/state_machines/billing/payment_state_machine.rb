# frozen_string_literal: true

module Billing
  class PaymentStateMachine
    include Statesman::Machine

    # TODO: Update Payment Item states when payment states change
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
    state :charged_back

    transition from: :created, to: %i[waiting_payment authorized refused]
    transition from: :authorized, to: %i[approved_on_antifraud declined_on_antifraud waiting_review]

    after_transition(after_commit: true) do |payment, transition|
      payment.state = transition.to_state
      payment.save!
    end
  end
end
