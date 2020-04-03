require 'rails_helper'

RSpec.describe Billing::Gateways::Pagarme::WebhookProcessor, type: :lib do
  subject { described_class.new(webhook) }
  let(:payment_request) { create(:payment_request, :credit_card) }
  let(:status) { nil }
  let(:webhook_body) { { transaction: { reference_key: payment_request.id, }}}
  let(:webhook) { create(:webhook, state: :received, body: webhook_body) }

  describe 'Public methods' do
    describe '#process!' do
      context 'when webhook can be ignored' do
        before { allow(subject).to receive(:ignore_webhook?).and_return(true) }

        it 'ignores webhook' do
          subject.process!

          expect(webhook).to be_ignored
        end

        it 'stop processing' do
          expect(subject).to_not receive(:change_payment_request_state)
          expect(webhook).to_not receive(:start_processing!)

          subject.process!
        end
      end

      context 'when webhook can be processed' do
        before do
          allow(subject).to receive(:ignore_webhook?).and_return(false)
          allow(subject).to receive(:change_payment_request_state).and_return(true)
        end

        it 'starts webhook processing' do
          expect(webhook).to receive(:start_processing!)

          subject.process!
        end

        it 'changes payment request state' do
          expect(subject).to receive(:change_payment_request_state)

          subject.process!
        end

        it 'finishes webhook processing' do
          subject.process!

          expect(webhook).to be_processed
        end
      end

      context 'when something goes wrong' do
        it 'handles error' do
          error = StandardError.new(Faker::Lorem.word)
          allow(subject).to receive(:ignore_webhook?).and_raise(error)

          expect(subject).to receive(:handle_error).with(error)

          subject.process!
        end
      end
    end
  end

  describe 'Private methods' do
    describe '#ignore_webhook?' do
      %w[processing authorized waiting_payment pending_refund].each do |state|
        context "when body current status is #{state}" do
          it 'returns true' do
            webhook.body.merge!('current_status' => state)

            expect(subject.send(:ignore_webhook?)).to be_truthy
          end
        end
      end

      context 'when body current status is different' do
        it 'returns false' do
          webhook.body.merge!('current_status' => Faker::Lorem.word)

          expect(subject.send(:ignore_webhook?)).to be_falsey
        end
      end
    end

    describe '#change_payment_request_state' do
      let(:status) { nil }

      before do
        allow(subject).to receive(:payment_request).and_return(payment_request)
        webhook.body.merge!('current_status' => status)
      end

      context 'when body current status is paid' do
        let(:status) { 'paid' }

        it 'settles payment request' do
          allow(payment_request).to receive(:settle!)
          expect(payment_request).to receive(:settle!)

          subject.send(:change_payment_request_state)
        end
      end

      context 'when body current status is refunded' do
        let(:status) { 'refunded' }

        context 'when payment request is paid' do
          before { allow(payment_request).to receive(:paid?).and_return(true) }

          it 'refunds payment request' do
            allow(payment_request).to receive(:refund!)
            expect(payment_request).to receive(:refund!)

            subject.send(:change_payment_request_state)
          end
        end

        context 'when payment request isn`t paid' do
          before { allow(payment_request).to receive(:paid?).and_return(false) }

          it 'refuses payment request' do
            allow(payment_request).to receive(:refuse!)
            expect(payment_request).to receive(:refuse!)

            subject.send(:change_payment_request_state)
          end
        end
      end

      context 'when body current status is refused' do
        let(:status) { 'refused' }

        it 'refuses payment request' do
          allow(payment_request).to receive(:refuse!)
          expect(payment_request).to receive(:refuse!)

          subject.send(:change_payment_request_state)
        end
      end

      context 'when body current status is chargedback' do
        let(:status) { 'chargedback' }

        it 'chargeback payment request' do
          allow(payment_request).to receive(:chargeback!)
          expect(payment_request).to receive(:chargeback!)

          subject.send(:change_payment_request_state)
        end
      end

      context 'when body current status is unknown' do
        let(:status) { Faker::Lorem.word }

        it 'raises error' do
          expect do
            subject.send(:change_payment_request_state)
          end.to raise_error('Unknown Pagarme status')
        end
      end
    end

    describe '#handle_error' do
      let(:error) { StandardError.new(Faker::Lorem.word) }

      it 'captures error with raven' do
        expect(Raven).to receive(:capture_message).with(
          'Webhook cannot be processed',
          level: :fatal,
          extra: { webhook_id: webhook.id, message: error.message }
        )

        subject.send(:handle_error, error)
      end

      it 'fails webhook processing' do
        subject.send(:handle_error, error)

        expect(webhook).to be_failed
        last_state_transition = webhook.state_transitions.order(:created_at).last
        expect(last_state_transition.description).to eq error.message
      end
    end
  end
end
