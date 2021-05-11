# frozen_string_literal: true

module Billing
  module CreditCards
    class SafelistQuery
      attr_reader :relation

      class << self
        delegate :call, to: :new
      end

      def initialize(relation = Billing::CreditCard)
        @relation = relation
      end

      def call
        relation.joins(:payments).where(billing_payments: { state: 'paid' })
      end
    end
  end
end
