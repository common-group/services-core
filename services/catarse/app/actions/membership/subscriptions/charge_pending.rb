# frozen_string_literal: true

module Membership
  module Subscriptions
    class ChargePending < Actor
      def call
        Membership::Subscription.pending_charge.find_each do |subscription|
          Membership::Subscriptions::Charge.result(subscription: subscription)
        end
      end
    end
  end
end
