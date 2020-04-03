require 'rails_helper'

RSpec.describe Billing::CaptureOrRefundTransactionAction, type: :action do
  describe 'Behavior' do
    context 'when payment request is approved on antifraud' do
      let(:payment_request) { double(approved_on_antifraud?: true, authorized?: false, gateway_id: Faker::Lorem.word) }

      it 'captures transaction' do
        expect(described_class.gateway_client).to receive(:capture_transaction)
          .with(gateway_id: payment_request.gateway_id)

        described_class.execute(payment_request: payment_request)
      end
    end

    context 'when payment request is authorized' do
      let(:payment_request) { double(approved_on_antifraud?: false, authorized?: true, gateway_id: Faker::Lorem.word) }

      it 'captures transaction' do
        expect(described_class.gateway_client).to receive(:capture_transaction)
          .with(gateway_id: payment_request.gateway_id)

        described_class.execute(payment_request: payment_request)
      end
    end

    context 'when payment request is declined on antifraud' do
      let(:payment_request) do
        double(
          approved_on_antifraud?: false,
          authorized?: false,
          declined_on_antifraud?: true,
          gateway_id: Faker::Lorem.word
        )
      end

      it 'refunds transaction' do
        expect(described_class.gateway_client).to receive(:refund_transaction)
          .with(gateway_id: payment_request.gateway_id)

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
  end
end
