module Billing
  class CreditCard < ActiveRecord::Base
    self.table_name = 'new_credit_cards'

    belongs_to :owner, polymorphic: true

    validates :owner_id, presence: true
    validates :owner_type, presence: true
    validates :gateway, presence: true
    validates :gateway_id, presence: true
    validates :holder_name, presence: true
    validates :first_digits, presence: true
    validates :last_digits, presence: true
    validates :expires_on, presence: true

    scope :safelist, -> {
      joins('INNER JOIN payment_requests ON payment_requests.id = new_credit_cards.owner_id')
        .where(owner_type: 'Billing::PaymentRequest', payment_requests: { state: :paid })
    }
  end
end
