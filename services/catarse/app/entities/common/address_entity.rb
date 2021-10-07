# frozen_string_literal: true

module Common
  class AddressEntity < BaseEntity
    expose :id
    expose :user_id
    expose :country_code
    expose :postal_code
    expose :line_1
    expose :line_2
    expose :number
    expose :neighborhood
    expose :city
    expose :state
    expose :phone_number
    expose :first_name
    expose :last_name
    expose :organization
  end
end
