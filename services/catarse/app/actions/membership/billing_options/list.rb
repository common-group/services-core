# frozen_string_literal: true

module Membership
  module BillingOptions
    class List < Actor
      input :tier_id, type: String

      output :billing_options, type: Enumerable

      def call
        tier = Membership::Tier.find(tier_id)

        self.billing_options = tier.billing_options
      end
    end
  end
end
