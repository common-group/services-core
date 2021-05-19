# frozen_string_literal: true

module Billing
  class CreditCard < ApplicationRecord
    belongs_to :user

    has_many :payments, class_name: 'Billing::Payment', dependent: :nullify

    has_enumeration_for :gateway, with: Billing::Gateways, required: true, create_helpers: true

    validates :user_id, presence: true
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
