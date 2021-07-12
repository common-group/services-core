# frozen_string_literal: true

module Membership
  module BillingOptions
    class Update < Actor
      input :id, type: String
      input :attributes, type: Hash

      output :billing_option, type: Membership::BillingOption

      def call
        self.billing_option = Membership::BillingOption.find(id)

        billing_option.update!(attributes)
      end
    end
  end
end
