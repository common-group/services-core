# frozen_string_literal: true

module Billing
  module Payments
    class Refuse < Actor
      input :payment, type: Billing::Payment
      input :metadata, type: Hash, default: {}

      def call
        fail!(error: 'Payment cannot transition to refused') unless payment.can_transition_to?(:refused)

        ActiveRecord::Base.transaction do
          payment.transition_to!(:refused, metadata)
          payment.items.each { |i| i.transition_to!(:canceled) }
        end
      end
    end
  end
end
