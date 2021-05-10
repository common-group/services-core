# frozen_string_literal: true

module Billing
  module Payments
    class Refuse < Actor
      input :payment, type: Billing::Payment
      input :metadata, type: Hash, default: {}

      def call
        fail!(error: 'Payment cannot transition to refused') unless payment.can_transition_to?(:refused)

        payment.transition_to!(:refused, metadata)
      end
    end
  end
end
