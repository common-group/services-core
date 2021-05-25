# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payments::GenerateBoleto, type: :action do
  describe 'Inputs' do
    subject(:inputs) { described_class.inputs }

    it { is_expected.to include(payment: { type: Billing::Payment }) }

    it 'injects pagar_me_client dependency' do
      proc = inputs.dig(:pagar_me_client, :default)
      expect(proc.call).to be_an_instance_of(PagarMe::Client)
    end
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    subject(:result) { described_class.result(payment: payment, pagar_me_client: pagar_me_client) }

    let(:payment) { create(:billing_payment, :created, :boleto) }
    let(:pagar_me_client) { PagarMe::Client.new }
    let(:transaction_params) { PagarMe::TransactionParamsBuilder.new(payment: payment).build }
    let(:gateway_response) do
      {
        'id' => Faker::Lorem.word,
        'status' => 'waiting_payment',
        'boleto_barcode' => Faker::Lorem.word,
        'boleto_url' => 'https://example.com/boleto',
        'boleto_expiration_date' => Faker::Date.between(from: Time.zone.tomorrow, to: 10.days.from_now).iso8601
      }
    end

    before do
      allow(pagar_me_client).to receive(:create_transaction).with(transaction_params).and_return(gateway_response)
    end

    it 'creates transaction on gateway' do
      expect(pagar_me_client).to receive(:create_transaction).with(transaction_params)

      result
    end

    context 'when payment method isn`t boleto' do
      before { allow(payment).to receive(:boleto?).and_return(false) }

      it 'doesn`t create transaction on gateway' do
        expect(pagar_me_client).not_to receive(:create_transaction)

        result
      end

      it 'doesn`t  change payment state' do
        expect(payment).not_to receive(:wait_payment!)

        result
      end
    end

    context 'when gateway response status is waiting_payment' do
      it { is_expected.to be_success }

      it 'transitions payment state to waiting payment' do
        expect(payment).to receive(:wait_payment!).with(gateway_response)

        result
      end

      it 'updates payment gateway_id' do
        result

        expect(payment.reload.gateway_id).to eq gateway_response['id']
      end

      it 'creates a new boleto' do
        result

        expect(payment.boleto.attributes).to include(
          'barcode' => gateway_response['boleto_barcode'],
          'url' => gateway_response['boleto_url'],
          'expires_at' => gateway_response['boleto_expiration_date'].to_datetime
        )
      end
    end

    context 'when gateway response status isn`t waiting_payment' do
      let(:gateway_response) { { 'status' => Faker::Lorem.word } }

      it { is_expected.to be_failure }

      it 'handles error as fatal error' do
        action = described_class.new(payment: payment, pagar_me_client: pagar_me_client)

        expect(action).to receive(:handle_fatal_error)
          .with('Invalid gateway request', { data: gateway_response, payment_id: payment.id, user_id: payment.user_id })

        action.call
      end
    end
  end
end
