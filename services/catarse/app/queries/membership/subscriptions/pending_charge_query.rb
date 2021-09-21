# frozen_string_literal: true

module Membership
  module Subscriptions
    class PendingChargeQuery
      attr_reader :relation

      class << self
        delegate :call, to: :new
      end

      def initialize(relation = Membership::Subscription)
        @relation = relation
      end

      def call
        relation
          .in_state(:active)
          .where.not(id: subscription_ids_with_pending_payments)
          .where(next_charge_on: (..Time.zone.today))
      end

      private

      def subscription_ids_with_pending_payments
        Billing::PaymentItem.subscriptions.in_state(:pending).select(:payable_id)
      end
    end
  end
end
