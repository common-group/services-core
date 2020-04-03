module Billing
  module Gateways
    module Pagarme
      class WebhookProcessor
        attr_reader :webhook, :payment_request

        def initialize(webhook)
          @webhook = webhook
          @payment_request = Billing::PaymentRequest.find(webhook.body.dig('transaction', 'reference_key'))
        end

        def process!
          webhook.ignore! and return if ignore_webhook?

          webhook.start_processing!

          ActiveRecord::Base.transaction do
            change_payment_request_state
            webhook.finish_processing!
          end
        rescue => e
          handle_error(e)
        end

        private

        def ignore_webhook?
          %w[processing authorized waiting_payment pending_refund].include?(webhook.body['current_status'])
        end

        def change_payment_request_state
          case webhook.body['current_status']
          when 'paid'
            payment_request.settle!
          when 'refunded'
            if payment_request.paid?
              payment_request.refund!
            else
              payment_request.refuse!
            end
          when 'refused'
            payment_request.refuse!
          when 'chargedback'
            payment_request.chargeback!
          else
            raise 'Unknown Pagarme status'
          end
        end

        def handle_error(error)
          Raven.capture_message(
            'Webhook cannot be processed',
            level: :fatal,
            extra: { webhook_id: webhook.id, message: error.message }
          )

          webhook.fail!(description: error.message)
        end
      end
    end
  end
end
