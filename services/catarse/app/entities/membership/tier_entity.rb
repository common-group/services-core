# frozen_string_literal: true

module Membership
  class TierEntity < BaseEntity
    expose :id
    expose :name
    expose :description
    expose :subscribers_limit
    expose :request_shipping_address
    expose :order
  end
end
