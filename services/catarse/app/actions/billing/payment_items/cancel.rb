# frozen_string_literal: true

module Billing
  module PaymentItems
    class Cancel < Actor
      input :payment_item, type: Billing::PaymentItem
      input :metadata, type: Hash, default: {}

      def call
        fail!(error: 'Payment item cannot transition to canceled') unless payment_item.can_transition_to?(:canceled)

        ActiveRecord::Base.transaction do
          payment_item.transition_to!(:canceled, metadata)
          payment_item.payable.transition_to!(:deleted) if payment_item.subscription?
        end
      end
    end
  end
end
