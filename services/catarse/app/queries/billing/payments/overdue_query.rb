# frozen_string_literal: true

module Billing
  module Payments
    class OverdueQuery
      attr_reader :relation

      class << self
        delegate :call, to: :new
      end

      def initialize(relation = Billing::Payment)
        @relation = relation
      end

      def call
        relation
          .in_state(:waiting_payment)
          .left_joins(:pix)
          .left_joins(:boleto)
          .where(payment_method: Billing::PaymentMethods.values_for(%w[BOLETO PIX]))
          .where('COALESCE(billing_pixes.expires_on, billing_boletos.expires_on) < ?', Time.zone.today)
      end
    end
  end
end
