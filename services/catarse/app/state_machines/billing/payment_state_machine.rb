# frozen_string_literal: true

module Billing
  class PaymentStateMachine
    include Statesman::Machine

    MAP_TO_PAYMENT_ITEM_STATE = {
      created: :pending,
      waiting_payment: :pending,
      authorized: :pending,
      approved_on_antifraud: :pending,
      declined_on_antifraud: :pending,
      waiting_review: :pending,
      paid: :paid,
      overdue: :canceled,
      refused: :canceled,
      refunded: :refunded,
      charged_back: :charged_back
    }.with_indifferent_access.freeze

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
    transition from: :authorized, to: %i[approved_on_antifraud declined_on_antifraud waiting_review paid]
    transition from: :waiting_review, to: %i[paid refused]
    transition from: :paid, to: %i[charged_back refunded]

    after_transition(after_commit: true) do |payment, transition|
      payment.update!(state: transition.to_state)
    end

    def wait_payment!(metadata = {})
      transition_to!(:waiting_payment, metadata)
    end

    def authorize!(metadata = {})
      transition_to!(:authorized, metadata)
    end

    def settle!(metadata = {})
      Billing::Payments::Settle.call(payment: object, metadata: metadata)
    end

    def refuse!(metadata = {})
      Billing::Payments::Refuse.call(payment: object, metadata: metadata)
    end

    def approve_on_antifraud!(metadata = {})
      transition_to!(:approved_on_antifraud, metadata)
    end

    def decline_on_antifraud!(metadata = {})
      transition_to!(:declined_on_antifraud, metadata)
    end

    def wait_review!(metadata = {})
      transition_to!(:waiting_review, metadata)
    end

    def refund!(metadata = {})
      Billing::Payments::Refund.call(payment: object, metadata: metadata)
    end

    def chargeback!(metadata = {})
      Billing::Payments::Chargeback.call(payment: object, metadata: metadata)
    end
  end
end
