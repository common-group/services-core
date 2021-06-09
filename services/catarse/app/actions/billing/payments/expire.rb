# frozen_string_literal: true

module Billing
  module Payments
    class Expire < Actor
      input :payment, type: Billing::Payment
      input :metadata, type: Hash, default: {}

      def call
        fail!(error: 'Payment cannot transition to expired') unless payment.can_transition_to?(:expired)

        ActiveRecord::Base.transaction do
          payment.transition_to!(:expired, metadata)
          payment.items.each { |i| i.transition_to!(:canceled) }
        end
      end
    end
  end
end
