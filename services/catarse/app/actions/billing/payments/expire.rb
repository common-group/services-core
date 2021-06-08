# frozen_string_literal: true

module Billing
  module Payments
    class Expire < Actor
      input :payment, type: Billing::Payment
      input :metadata, type: Hash, default: {}

      def call
        fail!(error: 'Payment cannot transition to overdue') unless payment.can_transition_to?(:overdue)

        ActiveRecord::Base.transaction do
          payment.transition_to!(:overdue, metadata)
          payment.items.each { |i| i.transition_to!(:canceled) }
        end
      end
    end
  end
end
