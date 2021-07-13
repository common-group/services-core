# frozen_string_literal: true

module Billing
  module Payments
    class Refund < Actor
      input :payment, type: Billing::Payment
      input :metadata, type: Hash, default: {}

      def call
        fail!(error: 'Payment cannot transition to refunded') unless payment.can_transition_to?(:refunded)

        ActiveRecord::Base.transaction do
          payment.transition_to!(:refunded, metadata)
          payment.items.each { |i| i.transition_to!(:refunded) }
        end
      end
    end
  end
end
