module Billing
  class PaymentRequestStateMachine
    include Statesman::Machine

    state :waiting_payment, initial: true
    state :paid
    state :expired
    state :refused
    state :refunded

    transition from: :waiting_payment, to: %i[paid expired refused]
    transition from: :paid, to: %i[refunded]

    after_transition do |payment_request, transition|
      payment_request.update(state: transition.to_state)
    end
  end
end
