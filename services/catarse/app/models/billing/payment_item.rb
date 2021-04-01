# frozen_string_literal: true

module Billing
  class PaymentItem < ApplicationRecord
    include Statesman::Adapters::ActiveRecordQueries[
      transition_class: Billing::PaymentItemStateTransition,
      initial_state: :pending,
      transition_name: :state_transitions
    ]

    after_create :create_inital_state_transition

    belongs_to :payment, class_name: 'Billing::Payment'
    belongs_to :payable, polymorphic: true

    has_many :state_transitions, class_name: 'Billing::PaymentItemStateTransition', dependent: :destroy, autosave: false

    monetize :amount_cents, numericality: { greater_than_or_equal_to: 1 }
    monetize :shipping_fee_cents, numericality: { greater_than_or_equal_to: 0 }
    monetize :total_amount_cents, numericality: { greater_than_or_equal_to: 1 }

    validates :payment_id, presence: true
    validates :payable_id, presence: true
    validates :payable_type, presence: true
    validates :state, presence: true

    validates :payable_id, uniqueness: { scope: %i[payable_type payment_id] }

    validates :state, inclusion: { in: Billing::PaymentItemStateMachine.states }

    def state_machine
      @state_machine ||= Billing::PaymentItemStateMachine.new(self,
        transition_class: Billing::PaymentItemStateTransition,
        association_name: :state_transitions
      )
    end

    private

    def create_inital_state_transition
      state_transitions.create(to_state: state, sort_key: 1, most_recent: true)
    end
  end
end
