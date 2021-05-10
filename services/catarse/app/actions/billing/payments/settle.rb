# frozen_string_literal: true

module Billing
  module Payments
    class Settle < Actor
      input :payment, type: Billing::Payment
      input :metadata, type: Hash, default: {}

      def call
        fail!(error: 'Payment cannot transition to paid') unless payment.can_transition_to?(:paid)

        payment.transition_to!(:paid, metadata)
      end
    end
  end
end
