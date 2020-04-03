module Billing
  class CaptureOrRefundTransactionAction
    extend LightService::Action

    expects :payment_request

    executed do |context|
      payment_request = context.payment_request
      if payment_request.approved_on_antifraud? || payment_request.authorized?
        gateway_client.capture_transaction(gateway_id: payment_request.gateway_id)
      elsif payment_request.declined_on_antifraud?
        gateway_client.refund_transaction(gateway_id: payment_request.gateway_id)
      end
    end

    def self.gateway_client
      @@gateway_client ||= Billing::Gateways::Pagarme::Client.new
    end
  end
end
