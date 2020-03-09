module Billing
  class CaptureOrRefundTransactionAction
    extend LightService::Action

    expects :payment_request

    executed do |context|
      payment_request = context.payment_request
      if payment_request.approved_on_antifraud? || payment_request.authorized?
        capture_transaction(payment_request)
      elsif payment_request.declined_on_antifraud?
        refund_transaction(payment_request)
      end
    end

    def self.gateway_client
      @@gateway_client ||= Billing::Gateways::Pagarme::Client.new
    end

    def self.capture_transaction(payment_request)
      response = gateway_client.capture_transaction(gateway_id: payment_request.gateway_id)

      unless response.success?
        Raven.capture_message(
          'Transaction cannot be captured on gateway',
          level: :fatal,
          user: { id: payment_request.user_id },
          extra: response.parsed_body.merge(payment_request_id: payment_request.id)
        )
      end
    end

    def self.refund_transaction(payment_request)
      response = gateway_client.refund_transaction(gateway_id: payment_request.gateway_id)

      unless response.success?
        Raven.capture_message(
          'Transaction cannot be refunded on gateway',
          level: :fatal,
          user: { id: payment_request.user_id },
          extra: response.parsed_body.merge(payment_request_id: payment_request.id)
        )
      end
    end
  end
end
