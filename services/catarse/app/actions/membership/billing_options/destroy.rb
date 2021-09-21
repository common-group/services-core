# frozen_string_literal: true

module Membership
  module BillingOptions
    class Destroy < Actor
      input :id, type: Integer

      def call
        billing_option = Membership::BillingOption.find(id)
        billing_option.destroy!
      end
    end
  end
end
