require 'rails_helper'

RSpec.describe Billing::GenerateBankSlipAction, type: :action do
  describe 'Behavior' do
    let(:payment_request) { double(:payment_request) }
    let(:gateway_client) { double(:gateway_client) }
    let(:transaction_params) { double(:transaction_params) }
    let(:bank_slip_attributes) { double(:bank_slip_attributes) }

    before do
      allow(described_class).to receive(:gateway_client).and_return(gateway_client)

      allow(described_class).to receive(:transaction_params).with(payment_request).and_return(transaction_params)

      allow(gateway_client).to receive(:create_transaction)
        .with(transaction_params: transaction_params)
        .and_return(gateway_response)

      allow(gateway_client).to receive(:extract_bank_slip_attributes)
        .with(gateway_response)
        .and_return(bank_slip_attributes)
    end

    context 'when transaction is waiting payment on gateway' do
      let(:gateway_response) { { status: 'waiting_payment', id: Faker::Lorem.word } }

      before do
        allow(payment_request).to receive(:update!)
        allow(payment_request).to receive(:create_bank_slip!)
      end

      it 'sets payment request state to waiting payment' do
        expect(payment_request).to receive(:wait_payment!).with(metadata: gateway_response)

        described_class.execute(payment_request: payment_request)
      end

      it 'updates gateway and gateway_id' do
        expect(payment_request).to receive(:update!).with(gateway: 'pagarme', gateway_id: gateway_response[:id])
        allow(payment_request).to receive(:wait_payment!)
        allow(payment_request).to receive(:create_bank_slip!)

        described_class.execute(payment_request: payment_request)
      end

      it 'creates payment request bank slip' do
        expect(payment_request).to receive(:create_bank_slip!).with(bank_slip_attributes)
        allow(payment_request).to receive(:wait_payment!)
        allow(payment_request).to receive(:update!)

        described_class.execute(payment_request: payment_request)
      end
    end

    context 'when transaction has a unknown state' do
      let(:payment_request) { double(:payment_request, user_id: Faker::Lorem.word, id: Faker::Lorem.word) }
      let(:gateway_response) { { status: Faker::Lorem.word } }

      it 'captures message via Raven' do
        expect(Raven).to receive(:capture_message)
          .with(
            'Invalid gateway request',
            level: :fatal,
            user: { id: payment_request.user_id },
            extra: gateway_response.merge(payment_request_id: payment_request.id)
          )

        described_class.execute(payment_request: payment_request)
      end

      it 'fails context' do
        context = described_class.execute(payment_request: payment_request)

        expect(context).to be_failure
      end
    end
  end

  describe 'Class methods' do
    describe '.gateway_client' do
      let(:gateway_client) { double }

      it 'instantiates new Pagarme client' do
        gateway_client = described_class.gateway_client
        expect(gateway_client).to be_a(Billing::Gateways::Pagarme::Client)
      end
    end

    describe '.transaction_params' do
      let(:payment_request) { double(:payment_request) }
      let(:data) { { key: 'value' } }
      let(:params_builder) { double(:params_builder, build: data) }

      before do
        allow(Billing::Gateways::Pagarme::TransactionParamsBuilder).to receive(:new)
        .with(payment_request)
        .and_return(params_builder)
      end

      it 'builds transaction params with Pagarme::TransactionParamsBuilder' do
        expect(described_class.transaction_params(payment_request)).to eq data
      end
    end
  end
end
