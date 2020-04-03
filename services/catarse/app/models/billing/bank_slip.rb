module Billing
  class BankSlip < ActiveRecord::Base
    belongs_to :payment_request, class_name: 'Billing::PaymentRequest'

    validates :payment_request_id, presence: true
    validates :gateway, presence: true
    validates :barcode, presence: true
    validates :url, presence: true
    validates :expires_on, presence: true
  end
end
