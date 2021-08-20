# frozen_string_literal: true

module Billing
  module PaymentItems
    class Refund < Actor
      input :payment_item, type: Billing::PaymentItem
      input :metadata, type: Hash, default: {}

      def call
        fail!(error: 'Payment item cannot transition to refunded') unless payment_item.can_transition_to?(:refunded)

        ActiveRecord::Base.transaction do
          payment_item.transition_to!(:refunded, metadata)
          # TODO: Handle charge retries before deactivate sub
          payment_item.payable.transition_to!(:inactive) if payment_item.subscription?
        end
      end
    end
  end
end
