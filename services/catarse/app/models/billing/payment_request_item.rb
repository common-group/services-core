module Billing
  class PaymentRequestItem < ActiveRecord::Base
    belongs_to :payment_request, class_name: 'Billing::PaymentRequest'
    belongs_to :payable, polymorphic: true

    validates :payment_request_id, presence: true
    validates :payable_type, presence: true
    validates :payable_id, presence: true
    validates :amount, presence: true

    validates :payable_id, uniqueness: { scope: %i[payable_type payment_request_id] }

    validates :amount, numericality: { greater_than: 0 }
  end
end
