# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PagarMe::WebhookProcessor, type: :client do
  describe '#run' do
    subject(:webhook_processor) { described_class.new(webhook: webhook) }

    let(:webhook) do
      create(:integrations_webhook, :received,
        body: {
          'event' => webhook_event,
          'current_status' => webhook_status,
          'transaction' => { 'reference_key' => payment.id }
        }
      )
    end
    let(:payment) { Billing::Payment.new(id: Faker::Internet.uuid) }
    let(:webhook_event) { 'transaction_status_changed' }
    let(:webhook_status) { 'paid' }

    before { allow(Billing::Payment).to receive(:find).with(payment.id).and_return(payment) }

    context 'when webhook event isn`t transaction_status_changed' do
      let(:webhook_event) { Faker::Lorem.word }

      it 'handles error with Sentry' do
        expect(Sentry).to receive(:capture_message)
          .with('Event not expected', level: :fatal, extra: { webhook_id: webhook.id })

        webhook_processor.run
      end

      it 'transitions webhook state to failed' do
        webhook_processor.run

        expect(webhook.reload).to be_in_state(:failed)
      end
    end

    %w[processing authorized waiting_payment pending_refund].each do |status|
      context "when webhook current status is #{status}" do
        let(:webhook_status) { status }

        it 'transitions webhook state to ignored' do
          webhook_processor.run

          expect(webhook.reload).to be_in_state(:ignored)
        end
      end
    end

    it 'transitions webhook state to processing' do
      expect { webhook_processor.run }.to change(webhook.history.where(to_state: 'processing'), :count).by(1)
    end

    context 'when webhook current status is paid' do
      let(:webhook_status) { 'paid' }

      it 'settles payment' do
        expect(Billing::Payments::Settle).to receive(:result)
          .with(payment: payment, metadata: { webhook_id: webhook.id })

        webhook_processor.run
      end
    end

    context 'when webhook current status is refunded and payment is paid' do
      let(:webhook_status) { 'refunded' }

      before { allow(payment).to receive(:in_state?).with(:paid).and_return(true) }

      it 'refunds payment' do
        expect(Billing::Payments::Refund).to receive(:result)
          .with(payment: payment, metadata: { webhook_id: webhook.id })

        webhook_processor.run
      end
    end

    context 'when webhook current status is refunded and payment isn`t paid' do
      let(:webhook_status) { 'refunded' }

      before { allow(payment).to receive(:in_state?).with(:paid).and_return(false) }

      it 'refuses payment' do
        expect(Billing::Payments::Refuse).to receive(:result)
          .with(payment: payment, metadata: { webhook_id: webhook.id })

        webhook_processor.run
      end
    end

    context 'when webhook current status is chargedback' do
      let(:webhook_status) { 'chargedback' }

      it 'charges back payment' do
        expect(Billing::Payments::Chargeback).to receive(:result)
          .with(payment: payment, metadata: { webhook_id: webhook.id })

        webhook_processor.run
      end
    end

    context 'when webhook current status is unknown' do
      let(:webhook_status) { Faker::Lorem.word }

      it 'handles error with Sentry' do
        expect(Sentry).to receive(:capture_message)
          .with('Unknown PagarMe transaction status', level: :fatal, extra: { webhook_id: webhook.id })

        webhook_processor.run
      end

      it 'transitions webhook state to failed' do
        webhook_processor.run

        expect(webhook.reload).to be_in_state(:failed)
      end
    end

    context 'when action processing fails' do
      let(:error_message) { Faker::Lorem.paragraph }

      before do
        allow(Billing::Payments::Settle).to receive(:result)
          .with(payment: payment, metadata: { webhook_id: webhook.id })
          .and_return(ServiceActor::Result.new(failure?: true, error: error_message))
      end

      it 'handles error with Sentry' do
        expect(Sentry).to receive(:capture_message)
          .with(error_message, level: :fatal, extra: { webhook_id: webhook.id })

        webhook_processor.run
      end

      it 'transitions webhook state to failed' do
        webhook_processor.run

        expect(webhook.reload).to be_in_state(:failed)
      end
    end

    context 'when action processing is successful' do
      before do
        allow(Billing::Payments::Settle).to receive(:result)
          .with(payment: payment, metadata: { webhook_id: webhook.id })
          .and_return(ServiceActor::Result.new(failure?: false))
      end

      it 'transitions webhook state to processed' do
        webhook_processor.run

        expect(webhook.reload).to be_in_state(:processed)
      end
    end
  end
end
