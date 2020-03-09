require 'rails_helper'

RSpec.describe Billing::CaptureOrRefundTransactionAction, type: :action do
  describe 'Behavior' do
    context 'when payment request is approved on antifraud' do
      let(:payment_request) { double(approved_on_antifraud?: true, authorized?: false) }

      it 'captures transaction' do
        expect(described_class).to receive(:capture_transaction).with(payment_request)

        described_class.execute(payment_request: payment_request)
      end
    end

    context 'when payment request is authorized' do
      let(:payment_request) { double(approved_on_antifraud?: false, authorized?: true) }

      it 'captures transaction' do
        expect(described_class).to receive(:capture_transaction).with(payment_request)

        described_class.execute(payment_request: payment_request)
      end
    end

    context 'when payment request is declined on antifraud' do
      let(:payment_request) { double(approved_on_antifraud?: false, authorized?: false, declined_on_antifraud?: true) }

      it 'refunds transaction' do
        expect(described_class).to receive(:refund_transaction).with(payment_request)

        described_class.execute(payment_request: payment_request)
      end
    end
  end

  describe 'Class methods' do
    describe '.gateway_client' do
      let(:gateway_client) { double }

      before { described_class.class_variable_set(:@@gateway_client, gateway_client) }

      context 'when @@gateway_client is present' do
        it 'returns @@gateway_client' do
          expect(described_class.gateway_client).to eq gateway_client
        end
      end

      context 'when @@gateway_client is nil' do
        before { described_class.class_variable_set(:@@gateway_client, nil) }

        it 'instantiates new Pagarme client' do
          expect(described_class.class_variable_get(:@@gateway_client)).to be_nil
          gateway_client = described_class.gateway_client
          expect(gateway_client).to be_a(Billing::Gateways::Pagarme::Client)
        end
      end
    end

    describe '.capture_transaction' do
      let(:payment_request) { double(gateway_id: Faker::Lorem, user_id: Faker::Lorem.word, id: Faker::Lorem.word) }
      let(:response) { double(success?: true) }

      before do
        allow_any_instance_of(Billing::Gateways::Pagarme::Client).to receive(:capture_transaction)
          .with(gateway_id: payment_request.gateway_id)
          .and_return(response)
      end

      it 'captures transaction' do
        expect_any_instance_of(Billing::Gateways::Pagarme::Client).to receive(:capture_transaction)
          .with(gateway_id: payment_request.gateway_id)

        described_class.capture_transaction(payment_request)
      end

      context 'when transaction capture fails' do
        let(:data) { { key: 'value' } }
        let(:response) { double(success?: false, parsed_body: data) }

        it 'captures message via Raven' do
          expect(Raven).to receive(:capture_message)
            .with(
              'Transaction cannot be captured on gateway',
              level: :fatal,
              user: { id: payment_request.user_id },
              extra: data.merge(payment_request_id: payment_request.id)
            )

          described_class.capture_transaction(payment_request)
        end
      end
    end

    describe '.refund_transaction' do
      let(:payment_request) { double(gateway_id: Faker::Lorem, user_id: Faker::Lorem.word, id: Faker::Lorem.word) }
      let(:response) { double(success?: true) }

      before do
        allow_any_instance_of(Billing::Gateways::Pagarme::Client).to receive(:refund_transaction)
          .with(gateway_id: payment_request.gateway_id)
          .and_return(response)
      end

      it 'captures transaction' do
        expect_any_instance_of(Billing::Gateways::Pagarme::Client).to receive(:refund_transaction)
          .with(gateway_id: payment_request.gateway_id)

        described_class.refund_transaction(payment_request)
      end

      context 'when transaction capture fails' do
        let(:data) { { key: 'value' } }
        let(:response) { double(success?: false, parsed_body: data) }

        it 'captures message via Raven' do
          expect(Raven).to receive(:capture_message)
            .with(
              'Transaction cannot be refunded on gateway',
              level: :fatal,
              user: { id: payment_request.user_id },
              extra: data.merge(payment_request_id: payment_request.id)
            )

          described_class.refund_transaction(payment_request)
        end
      end
    end
  end
end
