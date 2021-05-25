# frozen_string_literal: true

module Billing
  class PaymentItemStateMachine
    include Statesman::Machine

    state :pending, initial: true
    state :paid
    state :canceled
    state :refunded
    state :charged_back

    transition from: :pending, to: %i[paid canceled]
    transition from: :paid, to: %i[refunded charged_back]

    after_transition(after_commit: true) do |payment_item, transition|
      payment_item.update!(state: transition.to_state)
    end
  end
end
