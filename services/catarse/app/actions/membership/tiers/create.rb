# frozen_string_literal: true

module Membership
  module Tiers
    class Create < Actor
      input :attributes, type: Hash

      output :tier, type: Membership::Tier

      def call
        self.tier = Membership::Tier.create!(attributes)
      end
    end
  end
end
