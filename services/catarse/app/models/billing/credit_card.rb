# frozen_string_literal: true

module Billing
  class CreditCard < ApplicationRecord
    belongs_to :user
    belongs_to :billing_address, class_name: 'Common::Address'

    has_many :payments, class_name: 'Billing::Payment', dependent: :nullify

    has_enumeration_for :gateway, with: Billing::Gateways, required: true, create_helpers: true

    validates :user_id, presence: true
    validates :billing_address_id, presence: true
    validates :gateway, presence: true
    validates :gateway_id, presence: true
    validates :holder_name, presence: true
    validates :bin, presence: true
    validates :last_digits, presence: true
    validates :country, presence: true
    validates :brand, presence: true
    validates :expires_on, presence: true

    validate :billing_address_owner_matches_user, if: %i[user_id? billing_address_id?]

    scope :safelist, Billing::CreditCards::SafelistQuery

    private

    def billing_address_owner_matches_user
      return if user_id == billing_address.user_id

      errors.add(:billing_address_id, I18n.t('models.billing.credit_card.errors.invalid_billing_address'))
    end
  end
end
