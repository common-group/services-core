# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::GatewayPayables::Import, type: :action do
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

    let(:payment) { create(:billing_payment, installments_count: 1) }
    let(:pagar_me_client) { PagarMe::Client.new }

    before do
      allow(pagar_me_client).to receive(:list_transaction_payables)
        .with(payment.gateway_id)
        .and_return(gateway_response)
    end

    context 'when payables count is different from payment installments count' do
      let(:payment) { create(:billing_payment, :credit_card, installments_count: 2) }
      let(:gateway_response) { [{ foo: :bar }] }

      it { is_expected.to be_failure }
    end

    context 'when payables count matches payment installments count' do
      let(:gateway_response) { [payable_data] }
      let(:payable_data) do
        {
          'id' => '123456',
          'status' => 'waiting_funds',
          'amount' => 5984,
          'fee' => 155,
          'installment' => 3,
          'payment_date' => '2021-06-15T00:00:00.000Z'
        }
      end

      it 'creates a new gateway payable' do
        expect { result }.to change(payment.gateway_payables, :count).by(1)
      end

      it 'builds gateway payable from gateway response' do
        result

        gateway_payable = payment.gateway_payables.last

        expect(gateway_payable.attributes).to include(
          'gateway_id' => '123456',
          'state' => 'waiting_funds',
          'amount_cents' => 5984,
          'fee_cents' => 155,
          'installment_number' => 3,
          'paid_at' => '2021-06-15'.to_datetime,
          'data' => payable_data
        )
      end
    end

    context 'when payment has payable with same gateway id' do
      let!(:gateway_payable) { create(:billing_gateway_payable, payment: payment, gateway_id: '0123') }
      let(:gateway_response) { [payable_data] }
      let(:payable_data) do
        {
          'id' => '0123',
          'status' => 'waiting_funds',
          'amount' => 200,
          'fee' => 100,
          'installment' => 9,
          'payment_date' => '2021-01-01T00:00:00.000Z'
        }
      end

      it 'doesn`t create a new gateway payable' do
        expect { result }.not_to change(payment.gateway_payables, :count)
      end

      it 'updates gateway payable' do
        result

        expect(gateway_payable.reload.attributes).to include(
          'gateway_id' => '0123',
          'state' => 'waiting_funds',
          'amount_cents' => 200,
          'fee_cents' => 100,
          'installment_number' => 9,
          'paid_at' => '2021-01-01'.to_datetime,
          'data' => payable_data
        )
      end
    end

    context 'when payable data is invalid' do
      let(:gateway_response) { [payable_data] }
      let(:payable_data) { { 'id' => '0123' } }

      it 'raises error' do
        expect { result }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end
  end
end
