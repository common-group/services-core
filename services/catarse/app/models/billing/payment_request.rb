module Billing
  class PaymentRequest < ActiveRecord::Base
    include Billing::Concerns::PaymentRequestStateMachine

    as_enum :payment_method, %i[bank_slip credit_card], map: :string, source: :payment_method

    belongs_to :user
    belongs_to :billing_address, class_name: 'Address'

    has_one :credit_card, class_name: 'Billing::CreditCard', as: :owner, dependent: :destroy
    has_one :bank_slip, class_name: 'Billing::BankSlip', dependent: :destroy

    has_many :state_transitions, class_name: 'Billing::PaymentRequestStateTransition', dependent: :destroy
    has_many :items, class_name: 'Billing::PaymentRequestItem', dependent: :destroy, autosave: false

    validates :user_id, presence: true
    validates :billing_address_id, presence: true
    validates :total_amount, presence: true
    validates :payment_method, presence: true
    validates :installments_count, presence: true
    validates :state, presence: true

    validates :gateway_card_id, absence: true, if: :bank_slip?
    validates :gateway_card_hash, absence: true, if: :bank_slip?

    validates :total_amount, numericality: { greater_than: 0 }
    validates :installments_count, numericality: { greater_than: 0, less_than_or_equal_to: 6 }, if: :credit_card?
    validates :installments_count, numericality: { equal_to: 1 }, if: :bank_slip?

    validates :state, inclusion: { in: aasm.states.map(&:name).map(&:to_s) }

    validate :card_identifier_presence, if: :credit_card?

    private

    def card_identifier_presence
      if gateway_card_id.nil? && gateway_card_hash.nil?
        errors.add(:base, 'at least one of gateway_card_id or gateway_card_hash should be present')
      end
    end
  end
end
