# frozen_string_literal: true

module Billing
  module Payments
    class CaptureOrRefundTransaction < Actor
      input :payment, type: Billing::Payment
      input :pagarme_client, type: PagarMe::Client, default: -> { PagarMe::Client.new }

      def call
        if payment.in_state?(:authorized, :approved_on_antifraud)
          pagarme_client.capture_transaction(payment.gateway_id)
        elsif payment.in_state?(:declined_on_antifraud)
          pagarme_client.refund_transaction(payment.gateway_id)
        end
      end
    end
  end
end
