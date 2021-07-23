# frozen_string_literal: true

module Membership
  module Subscriptions
    class Create < Actor
      input :user, type: User
      input :attributes, type: Hash

      output :subscription, type: Membership::Subscription

      def call
        self.subscription = user.subscriptions.create!(subscription_attributes)
      end

      private

      def subscription_attributes
        billing_option = Membership::BillingOption.find(attributes[:billing_option_id])

        {
          project: billing_option.project,
          tier: billing_option.tier,
          billing_option: billing_option,
          cadence_in_months: billing_option.cadence_in_months,
          state: Membership::SubscriptionStateMachine.initial_state,
          amount_cents: attributes[:amount_cents]
        }
      end
    end
  end
end
