# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payments::CaptureOrRefundTransaction, type: :action do
  describe 'Inputs' do
    subject(:inputs) { described_class.inputs }

    it { is_expected.to include(payment: { type: Billing::Payment }) }

    it 'injects pagarme_client dependency' do
      proc = inputs.dig(:pagarme_client, :default)

      expect(proc.call).to be_an_instance_of(PagarMe::Client)
    end
  end

  describe 'Outputs' do
    subject(:outputs) { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    subject(:result) { described_class.result(payment: payment, pagarme_client: pagarme_client) }

    let(:pagarme_client) { PagarMe::Client.new }
    let(:gateway_response) do
      { id: Faker::Internet.uuid }
    end

    %i[authorized approved_on_antifraud].each do |payment_state|
      context "when payment state is #{payment_state}" do
        let(:payment) { create(:billing_payment, :credit_card, payment_state) }

        it 'captures transaction on gateway' do
          expect(pagarme_client).to receive(:capture_transaction).with(payment.gateway_id)

          result
        end
      end
    end

    context 'when payment state is declined_on_antifraud' do
      let(:payment) { create(:billing_payment, :credit_card, :declined_on_antifraud) }

      it 'refunds transaction on gateway' do
        expect(pagarme_client).to receive(:refund_transaction).with(payment.gateway_id)

        result
      end
    end
  end
end
