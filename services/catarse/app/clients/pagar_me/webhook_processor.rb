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
      action = mapped_actions[webhook.body['current_status']]

      raise 'Unknown PagarMe transaction status' if action.nil?

      payment.send(action, { webhook_id: webhook.id })
    end

    def mapped_actions
      {
        'paid' => :settle!,
        'refunded' => payment.in_state?(:paid) ? :refund! : :refuse!,
        'refused' => :refuse!,
        'chargedback' => :chargeback!
      }
    end

    def handle_error(error)
      Sentry.capture_message(error.message, level: :fatal, extra: { webhook_id: webhook.id })
      webhook.transition_to!(:failed) if webhook.can_transition_to?(:failed)
    end
  end
end
