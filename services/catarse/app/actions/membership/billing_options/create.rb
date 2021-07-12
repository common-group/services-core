# frozen_string_literal: true

module Membership
  module BillingOptions
    class Create < Actor
      input :tier_id, type: String
      input :attributes, type: Hash

      output :billing_option, type: Membership::BillingOption

      def call
        tier = Membership::Tier.find(tier_id)

        self.billing_option = tier.billing_options.create!(attributes)
      end
    end
  end
end
