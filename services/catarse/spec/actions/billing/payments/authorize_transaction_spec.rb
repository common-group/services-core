# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payments::AuthorizeTransaction, type: :action do
  describe 'Inputs' do
    subject(:inputs) { described_class.inputs }

    it { is_expected.to include(payment: { type: Billing::Payment }) }

    it 'injects pagar_me_client dependency' do
      proc = inputs.dig(:pagar_me_client, :default)

      expect(proc.call).to be_an_instance_of(PagarMe::Client)
    end
  end

  describe 'Outputs' do
    subject(:outputs) { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    subject(:result) { described_class.result(payment: payment, pagar_me_client: pagar_me_client) }

    let(:payment) { create(:simple_payment, :created) }
    let(:pagar_me_client) { PagarMe::Client.new }
    let(:transaction_params) { PagarMe::TransactionParamsBuilder.new(payment: payment).build }
    let(:gateway_response) { { 'status' => 'authorized', 'id' => Faker::Internet.uuid } }

    before do
      allow(pagar_me_client).to receive(:create_transaction).with(transaction_params).and_return(gateway_response)
    end

    it 'creates transaction on gateway' do
      expect(pagar_me_client).to receive(:create_transaction).with(transaction_params)

      result
    end

    context 'when gateway response status is authorized' do
      before { gateway_response['status'] = 'authorized' }

      it { is_expected.to be_success }

      it 'calls authorize! on payment' do
        expect(payment).to receive(:authorize!).with(gateway_response)

        result
      end

      it 'updates payment gateway_id' do
        result

        expect(payment.reload.gateway_id).to eq(gateway_response['id'])
      end
    end

    context 'when gateway response status is refused' do
      before { gateway_response['status'] = 'refused' }

      it { is_expected.to be_success }

      it 'calls refuse! on payment' do
        expect(payment).to receive(:refuse!).with(gateway_response)

        result
      end

      it 'updates payment gateway_id' do
        result

        expect(payment.reload.gateway_id).to eq(gateway_response['id'])
      end
    end

    context 'when gateway response status is unexpected' do
      let(:gateway_response) { { 'status' => Faker::Lorem.word } }

      it { is_expected.to be_failure }

      it 'sends message error to Sentry' do
        data = { level: :fatal, extra: { data: gateway_response, payment_id: payment.id, user_id: payment.user_id } }
        expect(Sentry).to receive(:capture_message).with('Invalid gateway request', data)

        result
      end
    end
  end
end
