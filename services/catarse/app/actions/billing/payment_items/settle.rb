# frozen_string_literal: true

module Billing
  module PaymentItems
    class Settle < Actor
      input :payment_item, type: Billing::PaymentItem
      input :metadata, type: Hash, default: {}

      def call
        fail!(error: 'Payment item cannot transition to paid') unless payment_item.can_transition_to?(:paid)

        ActiveRecord::Base.transaction do
          payment_item.transition_to!(:paid, metadata)
          payment_item.payable.transition_to!(:active) if payment_item.subscription?
        end
      end
    end
  end
end
