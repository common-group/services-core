# frozen_string_literal: true

module Billing
  module Payments
    class Chargeback < Actor
      input :payment, type: Billing::Payment
      input :metadata, type: Hash, default: {}

      def call
        fail!(error: 'Payment cannot transition to charged_back') unless payment.can_transition_to?(:charged_back)

        ActiveRecord::Base.transaction do
          payment.transition_to!(:charged_back, metadata)
          payment.items.each { |i| i.chargeback! }
        end
      end
    end
  end
end
