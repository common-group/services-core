module Billing
  class PaymentRequest < ActiveRecord::Base
    include Billing::Concerns::PaymentRequestStateMachine

    as_enum :payment_method, %i[bank_slip credit_card], map: :string, source: :payment_method

    belongs_to :user
    belongs_to :billing_address, class_name: 'Address'

    has_many :state_transitions, class_name: 'Billing::PaymentRequestStateTransition', dependent: :destroy
    has_many :items, class_name: 'Billing::PaymentRequestItem', dependent: :destroy

    validates :user_id, presence: true
    validates :address_id, presence: true
    validates :total_amount, presence: true
    validates :payment_method, presence: true
    validates :installments_count, presence: true
    validates :state, presence: true
    validates :gateway_fee, presence: true

    validates :total_amount, numericality: { greater_than: 0 }
    validates :installments_count, numericality: { greater_than: 0, less_than_or_equal_to: 6 }
    validates :state, inclusion: { in: Billing::PaymentRequest.aasm.states.map(&:name) }
  end
end
