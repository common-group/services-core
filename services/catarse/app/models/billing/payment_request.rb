module Billing
  class PaymentRequest < ActiveRecord::Base
    include Billing::Concerns::PaymentRequestStateMachine

    as_enum :payment_method, %i[bank_slip credit_card], map: :string, source: :payment_method

    has_many :state_transitions, class_name: 'Billing::PaymentRequestStateTransition', dependent: :destroy
    has_many :items, class_name: 'Billing::PaymentRequestItem', dependent: :destroy
  end
end
