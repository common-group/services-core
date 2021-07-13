# frozen_string_literal: true

module Membership
  module Tiers
    class Destroy < Actor
      input :id, type: String

      def call
        tier = Membership::Tier.find(id)

        tier.destroy!
      end
    end
  end
end
