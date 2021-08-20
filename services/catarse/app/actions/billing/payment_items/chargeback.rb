# frozen_string_literal: true

module Billing
  module PaymentItems
    class Chargeback < Actor
      input :payment_item, type: Billing::PaymentItem
      input :metadata, type: Hash, default: {}

      def call
        error_message = 'Payment item cannot transition to charged_back'
        fail!(error: error_message) unless payment_item.can_transition_to?(:charged_back)

        ActiveRecord::Base.transaction do
          payment_item.transition_to!(:charged_back, metadata)
          payment_item.payable.transition_to!(:inactive) if payment_item.subscription?
        end
      end
    end
  end
end
