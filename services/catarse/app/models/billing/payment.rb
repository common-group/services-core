# frozen_string_literal: true

module Billing
  class Payment < ApplicationRecord
    include Statesman::Adapters::ActiveRecordQueries[
      transition_class: Billing::PaymentStateTransition,
      initial_state: :created,
      transition_name: :state_transitions
    ]

    after_create :create_inital_state_transition

    belongs_to :user

    belongs_to :billing_address, class_name: 'Shared::Address'
    belongs_to :shipping_address, class_name: 'Shared::Address', optional: true

    has_many :items, class_name: 'Billing::PaymentItem', dependent: :destroy
    has_many :state_transitions, class_name: 'Billing::PaymentStateTransition', dependent: :destroy, autosave: false

    monetize :total_amount_cents, numericality: { greater_than_or_equal_to: 1 }

    has_enumeration_for :payment_method, with: Billing::PaymentMethods, required: true

    validates :user_id, presence: true
    validates :billing_address_id, presence: true
    validates :state, presence: true
    validates :gateway, presence: true

    validates :gateway_id, uniqueness: { scope: :gateway }, allow_nil: true

    validates :state, inclusion: { in: Billing::PaymentStateMachine.states }

    def state_machine
      @state_machine ||= Billing::PaymentStateMachine.new(self,
        transition_class: Billing::PaymentStateTransition,
        association_name: :state_transitions
      )
    end

    private

    def create_inital_state_transition
      state_transitions.create(to_state: state, sort_key: 1, most_recent: true)
    end
  end
end
