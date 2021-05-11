# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payments::GeneratePix, type: :action do
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

    let(:payment) { create(:billing_payment, :created, :pix) }
    let(:pagar_me_client) { PagarMe::Client.new }
    let(:transaction_params) { PagarMe::TransactionParamsBuilder.new(payment: payment).build }
    let(:gateway_response) do
      {
        'id' => Faker::Lorem.word,
        'status' => 'waiting_payment',
        'pix_qr_code' => Faker::Lorem.word,
        'pix_expiration_date' => Faker::Date.between(from: Time.zone.tomorrow, to: 10.days.from_now).iso8601
      }
    end

    before do
      allow(pagar_me_client).to receive(:create_transaction).with(transaction_params).and_return(gateway_response)
    end

    it 'creates transaction' do
      expect(pagar_me_client).to receive(:create_transaction).with(transaction_params)

      result
    end

    context 'when payment method isn`t pix' do
      before { allow(payment).to receive(:pix?).and_return(false) }

      it 'doesn`t create transaction on gateway' do
        expect(pagar_me_client).not_to receive(:create_transaction)

        result
      end

      it 'doesn`t  change payment state' do
        result

        expect(payment.reload).to be_in_state('created')
      end
    end

    context 'when user response status is waiting_payment' do
      it { is_expected.to be_success }

      it 'transitions payment state to waiting_payment' do
        result

        expect(payment.reload).to be_in_state('waiting_payment')
      end

      it 'updates gateway and gateway_id' do
        result

        expect(payment.reload.attributes).to include('gateway' => 'pagar_me', 'gateway_id' => gateway_response['id'])
      end

      it 'creates a new pix' do
        result

        expect(payment.reload.pix.attributes).to include(
          'key' => gateway_response['pix_qr_code'],
          'expires_at' => gateway_response['pix_expiration_date'].to_datetime
        )
      end
    end

    context 'when response status isn`t waiting_payment' do
      let(:gateway_response) { { 'status' => 'error' } }

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
