require 'rails_helper'

RSpec.describe Billing::Antifraud::Konduto::WebhookProcessor, type: :lib do
  subject { described_class.new(webhook) }
  let(:payment_request) { create(:payment_request, :credit_card) }
  let(:status) { nil }
  let(:webhook) { create(:webhook, state: :received, body: { 'order_id' => payment_request.id, status: status }) }

  describe 'Public methods' do
    describe '#process!' do
      before { allow(subject).to receive(:capture_or_refund_transaction).and_return(double(success?: true)) }

      it 'starts webhook processing' do
        expect(webhook).to receive(:start_processing!)

        subject.process!
      end

      it 'captures or refunds transaction' do
        expect(subject).to receive(:capture_or_refund_transaction)

        subject.process!
      end

      context 'when transaction capture/refund is sucessfull' do
        before { allow(subject).to receive(:capture_or_refund_transaction).and_return(double(success?: true)) }

        it 'finishes webhook processing' do
          subject.process!

          expect(webhook).to be_processed
        end
      end

      context 'when transaction capture/refund fails' do
        it 'fails webhook processing' do
          allow(subject).to receive(:capture_or_refund_transaction).and_return(double(success?: false))

          subject.process!

          expect(webhook).to be_failed
          last_state_transition = webhook.state_transitions.order(:created_at).last
          expect(last_state_transition.description).to eq 'Transaction cannot be captured or refunded on gateway'
        end
      end

      context 'when something goes wrong' do
        before { allow(subject).to receive(:capture_or_refund_transaction).and_raise('Some error') }

        it 'captures error via Raven' do
          expect(Raven).to receive(:capture_message)
            .with('Webhook cannot be processed', level: :fatal, extra: { webhook_id: webhook.id, message: 'Some error' })

          subject.process!
        end

        it 'fails webhook processing' do
          subject.process!

          expect(webhook).to be_failed
        end
      end
    end

    describe 'Private methods' do
      describe '#capture_or_refund_transaction' do
        context 'when webhook body status is APPROVED' do
          let(:status) { 'APPROVED' }

          it 'captures transaction on gateway' do
            expect(subject.gateway_client).to receive(:capture_transaction).with(gateway_id: payment_request.gateway_id)

            subject.send(:capture_or_refund_transaction)
          end
        end

        context 'when webhook body status is DECLINED' do
          let(:status) { 'DECLINED' }

          it 'refunds transaction on gateway' do
            expect(subject.gateway_client).to receive(:refund_transaction).with(gateway_id: payment_request.gateway_id)

            subject.send(:capture_or_refund_transaction)
          end
        end
      end
    end
  end
end
