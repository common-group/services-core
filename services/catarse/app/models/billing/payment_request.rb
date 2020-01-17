module Billing
  class PaymentRequest < ActiveRecord::Base
    include Statesman::Adapters::ActiveRecordQueries

    as_enum :payment_method, %i[bank_slip credit_card], map: :string, source: :payment_method

    has_many :transitions, class_name: 'Billing::PaymentRequestTransition', autosave: false
    has_many :items, class_name: 'Billing::PaymentRequestItem'

    def state_machine
      @state_machine ||= PaymentRequestStateMachine.new(
        self,
        transition_class: Billing::PaymentRequestTransition,
        association_name: :transitions
      )
    end

    def self.transition_name
      :transitions
    end

    private_class_method def self.transition_class
      Billing::PaymentRequestTransition
    end

    private_class_method def self.initial_state
      Billing::PaymentRequestStateMachine.initial_state
    end
  end
end
