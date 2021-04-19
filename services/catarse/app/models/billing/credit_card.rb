module Billing
  class CreditCard < ApplicationRecord
    belongs_to :user
    belongs_to :payment, class_name: 'Billing::Payment'

    validates :user_id, presence: true
    validates :payment_id, presence: true
    validates :gateway, presence: true
    validates :gateway_id, presence: true
    validates :holder_name, presence: true
    validates :bin, presence: true
    validates :last_digits, presence: true
    validates :country, presence: true
    validates :brand, presence: true
    validates :expires_on, presence: true

    scope :safelist, Billing::CreditCards::SafelistQuery
  end
end
