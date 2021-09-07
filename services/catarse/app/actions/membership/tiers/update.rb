# frozen_string_literal: true

module Membership
  module Tiers
    class Update < Actor
      input :id, type: Integer
      input :attributes, type: Hash

      output :tier, type: Membership::Tier

      def call
        self.tier = Membership::Tier.find(id)

        tier.update!(attributes)
      end
    end
  end
end
