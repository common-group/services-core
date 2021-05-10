# frozen_string_literal: true

module PagarMe
  class WebhookProcessor
    attr_reader :webhook, :payment

    def initialize(webhook:)
      @webhook = webhook
      @payment = Billing::Payment.find(webhook.body.dig('transaction', 'reference_key'))
    end

    def run
      raise 'Event not expected' if webhook.body['event'] != 'transaction_status_changed'

      webhook.transition_to!(:ignored) and return if can_be_ignored?

      webhook.transition_to!(:processing)
      handle_status_change
      webhook.transition_to!(:processed)
    rescue StandardError => e
      handle_error(e)
    end

    private

    def can_be_ignored?
      %w[processing authorized waiting_payment pending_refund].include?(webhook.body['current_status'])
    end

    def handle_status_change
      action = next_action

      result = action.result(payment: payment, metadata: { webhook_id: webhook.id })

      raise result.error if result.failure?
    end

    def next_action
      action = mapped_actions[webhook.body['current_status']]
      raise 'Unknown PagarMe transaction status' if action.nil?

      action
    end

    def mapped_actions
      {
        'paid' => Billing::Payments::Settle,
        'refunded' => payment.in_state?(:paid) ? Billing::Payments::Refund : Billing::Payments::Refuse,
        'refused' => Billing::Payments::Refuse,
        'chargedback' => Billing::Payments::Chargeback
      }
    end

    def handle_error(error)
      Sentry.capture_message(error.message, level: :fatal, extra: { webhook_id: webhook.id })
      webhook.transition_to!(:failed) if webhook.can_transition_to?(:failed)
    end
  end
end
