# frozen_string_literal: true

module Konduto
  class WebhookProcessor
    attr_reader :pagar_me_client, :webhook, :payment

    def initialize(webhook:, pagar_me_client: PagarMe::Client.new)
      @webhook = webhook
      @pagar_me_client = pagar_me_client
      @payment = Billing::Payment.find(webhook.body['order_id'])
    end

    def run
      webhook.transition_to!(:processing)

      gateway_response = capture_or_refund_transaction

      raise 'Transaction cannot be captured or refunded' unless gateway_response.success?

      webhook.transition_to!(:processed)
    rescue StandardError => e
      Sentry.capture_message(e.message, level: :fatal, extra: { webhook_id: webhook.id })
      webhook.transition_to!(:failed) if webhook.can_transition_to?(:failed)
    end

    private

    def capture_or_refund_transaction
      case webhook.body['status']
      when 'APPROVED'
        pagar_me_client.capture_transaction(payment.gateway_id)
      when 'DECLINED', 'NOT_AUTHORIZED', 'CANCELED', 'FRAUD'
        pagar_me_client.refund_transaction(payment.gateway_id)
      else
        raise "Unknown order status: #{webhook.body['status']}"
      end
    end
  end
end
