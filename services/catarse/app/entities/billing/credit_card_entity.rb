# frozen_string_literal: true

module Billing
  class CreditCardEntity < BaseEntity
    expose :id
    expose :billing_address, using: ::Common::AddressEntity
    expose :holder_name
    expose :bin
    expose :last_digits
    expose :brand
    expose :expires_on, format_with: :iso_timestamp
  end
end
