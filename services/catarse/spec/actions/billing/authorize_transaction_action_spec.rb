require 'rails_helper'

RSpec.describe Billing::AuthorizeTransactionAction, type: :action do
  describe 'Behavior' do
    let(:payment_request) { double(:payment_request) }
    let(:gateway_client) { double(:gateway_client) }
    let(:transaction_params) { double(:transaction_params) }
    let(:credit_card_attributes) { double(:credit_card_attributes) }

    before do
      allow(described_class).to receive(:gateway_client).and_return(gateway_client)

      allow(described_class).to receive(:transaction_params).with(payment_request).and_return(transaction_params)

      allow(gateway_client).to receive(:create_transaction)
        .with(transaction_params: transaction_params)
        .and_return(gateway_response)

      allow(gateway_client).to receive(:extract_credit_card_attributes)
        .with(gateway_response)
        .and_return(credit_card_attributes)
    end

    context 'when transaction is authorized on gateway' do
      let(:gateway_response) { { status: 'authorized', id: Faker::Lorem.word } }

      before do
        allow(payment_request).to receive(:update!)
        allow(payment_request).to receive(:create_credit_card!)
      end

      it 'authorize payment request' do
        expect(payment_request).to receive(:authorize!).with(metadata: gateway_response)

        described_class.execute(payment_request: payment_request)
      end

      it 'updates gateway and gateway_id' do
        expect(payment_request).to receive(:update!).with(gateway: 'pagarme', gateway_id: gateway_response[:id])
        allow(payment_request).to receive(:authorize!)
        allow(payment_request).to receive(:create_credit_card!)

        described_class.execute(payment_request: payment_request)
      end

      it 'creates payment request credit card' do
        expect(payment_request).to receive(:create_credit_card!).with(credit_card_attributes)
        allow(payment_request).to receive(:authorize!)
        allow(payment_request).to receive(:update!)

        described_class.execute(payment_request: payment_request)
      end
    end

    context 'when transaction is refused on gateway' do
      let(:gateway_response) { { status: 'refused', id: Faker::Lorem.word } }

      before do
        allow(payment_request).to receive(:update!)
        allow(payment_request).to receive(:create_credit_card!)
      end

      it 'authorize payment request' do
        expect(payment_request).to receive(:refuse!).with(metadata: gateway_response)

        described_class.execute(payment_request: payment_request)
      end

      it 'updates gateway and gateway_id' do
        expect(payment_request).to receive(:update!).with(gateway: 'pagarme', gateway_id: gateway_response[:id])
        allow(payment_request).to receive(:refuse!)
        allow(payment_request).to receive(:create_credit_card!)

        described_class.execute(payment_request: payment_request)
      end

      it 'creates payment request credit card' do
        expect(payment_request).to receive(:create_credit_card!).with(credit_card_attributes)
        allow(payment_request).to receive(:refuse!)
        allow(payment_request).to receive(:update!)

        described_class.execute(payment_request: payment_request)
      end
    end

    context 'when authorization returns an unknown status' do
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
