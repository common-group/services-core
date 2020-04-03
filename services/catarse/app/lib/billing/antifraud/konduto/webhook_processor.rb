module Billing
  module Antifraud
    module Konduto
      class WebhookProcessor
        attr_reader :webhook, :payment_request, :gateway_client

        def initialize(webhook)
          @webhook = webhook
          @payment_request = Billing::PaymentRequest.find(webhook.body['order_id'])
          @gateway_client = Billing::Gateways::Pagarme::Client.new
        end

        def process!
          webhook.start_processing!

          ActiveRecord::Base.transaction do
            response = capture_or_refund_transaction

            if response.success?
              webhook.finish_processing!
            else
              webhook.fail!(description: 'Transaction cannot be captured or refunded on gateway')
            end
          end
        rescue => e
          Raven.capture_message(
            'Webhook cannot be processed',
            level: :fatal,
            extra: { webhook_id: webhook.id, message: e.message }
          )

          webhook.fail!(description: e.message)
        end

        private

        def capture_or_refund_transaction
          case webhook.body['status'].upcase
          when 'APPROVED'
            gateway_client.capture_transaction(gateway_id: payment_request.gateway_id)
          when 'DECLINED'
            gateway_client.refund_transaction(gateway_id: payment_request.gateway_id)
          end
        end
      end
    end
  end
end
