# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::ProcessingFees::ImportGatewayFee, type: :action do
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

    let(:payment) { create(:billing_payment) }
    let(:pagar_me_client) { PagarMe::Client.new }
    let(:transaction_data) { { 'cost' => Faker::Number.number(digits: 3) } }

    before do
      allow(pagar_me_client).to receive(:find_transaction).with(payment.gateway_id).and_return(transaction_data)
      allow(Billing::GatewayPayables::Import).to receive(:result)
        .with(payment: payment)
        .and_return(ServiceActor::Result.new(failure?: false))
    end

    context 'when payables import fails' do
      before do
        allow(Billing::GatewayPayables::Import).to receive(:result)
          .with(payment: payment)
          .and_return(ServiceActor::Result.new(failure?: true))
      end

      it { is_expected.to be_failure }
    end

    it 'creates a processing fee' do
      gateway_fees = payment.processing_fees.where(vendor: Billing::ProcessingFeeVendors::PAGAR_ME)
      expect { result }.to change(gateway_fees, :count).by(1)
    end

    context 'when payment is a credit card payment' do
      let!(:gateway_payable_a) { create(:billing_gateway_payable, payment: payment) }
      let!(:gateway_payable_b) { create(:billing_gateway_payable, payment: payment) }

      before { payment.payment_method = Billing::PaymentMethods::CREDIT_CARD }

      it 'assigns transaction cost + payables fee to processing fee' do
        result

        expected_amount = gateway_payable_a.fee_cents + gateway_payable_b.fee_cents + transaction_data['cost']
        expect(payment.processing_fees.last.amount_cents).to eq expected_amount
      end
    end

    context 'when payment is a pix payment with payables fee' do
      let!(:gateway_payable_a) { create(:billing_gateway_payable, payment: payment) }
      let!(:gateway_payable_b) { create(:billing_gateway_payable, payment: payment) }

      before { payment.payment_method = Billing::PaymentMethods::PIX }

      it 'assigns payables fee to processing fee' do
        result

        expected_amount = gateway_payable_a.fee_cents + gateway_payable_b.fee_cents
        expect(payment.processing_fees.last.amount_cents).to eq expected_amount
      end
    end

    context 'when payment is a pix payment without payables fee' do
      before { payment.payment_method = Billing::PaymentMethods::PIX }

      it 'assigns transaction cost to processing fee' do
        result

        expect(payment.processing_fees.last.amount_cents).to eq transaction_data['cost']
      end
    end

    context 'when payment is a boleto payment with payables fee' do
      let!(:gateway_payable_a) { create(:billing_gateway_payable, payment: payment) }
      let!(:gateway_payable_b) { create(:billing_gateway_payable, payment: payment) }

      before { payment.payment_method = Billing::PaymentMethods::BOLETO }

      it 'assigns payables fee to processing fee' do
        result

        expected_amount = gateway_payable_a.fee_cents + gateway_payable_b.fee_cents
        expect(payment.processing_fees.last.amount_cents).to eq expected_amount
      end
    end

    context 'when payment is a boleto payment without payables fee' do
      before { payment.payment_method = Billing::PaymentMethods::BOLETO }

      it 'assigns transaction cost to processing fee' do
        result

        expect(payment.processing_fees.last.amount_cents).to eq transaction_data['cost']
      end
    end
  end
end
