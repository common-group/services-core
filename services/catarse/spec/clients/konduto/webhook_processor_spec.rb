# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Konduto::WebhookProcessor, type: :client do
  describe '#run' do
    subject(:webhook_processor) { described_class.new(webhook: webhook, pagar_me_client: pagar_me_client) }

    let(:webhook) do
      create(:integrations_webhook, :received, body: { 'status' => webhook_status, 'order_id' => payment.id })
    end
    let(:pagar_me_client) { PagarMe::Client.new }
    let(:payment) { Billing::Payment.new(id: Faker::Internet.uuid, gateway_id: Faker::Internet.uuid) }
    let(:webhook_status) { 'APPROVED' }

    before do
      allow(Billing::Payment).to receive(:find).with(payment.id).and_return(payment)
      allow(pagar_me_client).to receive(:capture_transaction)
        .with(payment.gateway_id)
        .and_return(instance_double(HTTParty::Response, success?: true))
    end

    context 'when webhook state cannot transition to processing' do
      let(:webhook) { create(:integrations_webhook, :processed, body: { 'order_id' => payment.id }) }

      it 'handles error with Sentry' do
        expect(Sentry).to receive(:capture_message)
          .with("Cannot transition from 'processed' to 'processing'", level: :fatal, extra: { webhook_id: webhook.id })

        webhook_processor.run
      end

      it 'doesn`t change webhook state' do
        webhook_processor.run

        expect(webhook.reload).to be_in_state(:processed)
      end
    end

    it 'transitions webhook state to processing' do
      expect { webhook_processor.run }.to change(webhook.history.where(to_state: 'processing'), :count).by(1)
    end

    context 'when webhook status is APPROVED' do
      let(:webhook_status) { 'APPROVED' }

      it 'captures transaction on gateway' do
        expect(pagar_me_client).to receive(:capture_transaction).with(payment.gateway_id)

        webhook_processor.run
      end
    end

    %w[DECLINED NOT_AUTHORIZED CANCELED FRAUD].each do |status|
      context "when webhook status is #{status}" do
        let(:webhook_status) { status }

        it 'refunds transition on gateway' do
          expect(pagar_me_client).to receive(:refund_transaction).with(payment.gateway_id)

          webhook_processor.run
        end
      end
    end

    context 'when webhook status is unknown' do
      let(:webhook_status) { Faker::Lorem.word }

      it 'handles error with Sentry' do
        expect(Sentry).to receive(:capture_message)
          .with("Unknown order status: #{webhook_status}", level: :fatal, extra: { webhook_id: webhook.id })

        webhook_processor.run
      end

      it 'transisions webhook state to failed' do
        webhook_processor.run

        expect(webhook.reload).to be_in_state(:failed)
      end
    end

    context 'when capture or refund on gateway fails' do
      before do
        allow(pagar_me_client).to receive(:capture_transaction)
          .with(payment.gateway_id)
          .and_return(instance_double(HTTParty::Response, success?: false))
      end

      it 'handles error with Sentry' do
        expect(Sentry).to receive(:capture_message)
          .with('Transaction cannot be captured or refunded', level: :fatal, extra: { webhook_id: webhook.id })

        webhook_processor.run
      end

      it 'transisions webhook state to failed' do
        webhook_processor.run

        expect(webhook.reload).to be_in_state(:failed)
      end
    end

    context 'when capture or refund on gateway is successful' do
      before do
        allow(pagar_me_client).to receive(:capture_transaction)
          .with(payment.gateway_id)
          .and_return(instance_double(HTTParty::Response, success?: true))
      end

      it 'transitions webhook state to processed' do
        webhook_processor.run

        expect(webhook.reload).to be_in_state(:processed)
      end
    end
  end
end
