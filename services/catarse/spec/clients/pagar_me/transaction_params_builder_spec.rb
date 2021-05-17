# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PagarMe::TransactionParamsBuilder, type: :params_builder do
  describe '#build' do
    subject(:result) { described_class.new(payment: payment).build }

    context 'when payment_method is credit_card with credit card registered' do
      let(:payment) { create(:billing_payment, :with_credit_card) }

      it 'returns credit card transaction params with card_id' do
        expect(result).to eq(
          reference_key: payment.id,
          payment_method: Billing::PaymentMethods::CREDIT_CARD,
          amount: payment.total_amount_cents,
          installments: payment.installments_count,
          async: false,
          postback_url: 'https://example.com',
          capture: false,
          card_id: payment.credit_card.gateway_id
        )
      end
    end

    context 'when payment_method is credit_card without credit card registered' do
      let(:payment) { create(:billing_payment, :credit_card) }

      it 'returns credit card transaction params with card_hash' do
        expect(result).to eq(
          reference_key: payment.id,
          payment_method: Billing::PaymentMethods::CREDIT_CARD,
          amount: payment.total_amount_cents,
          installments: payment.installments_count,
          async: false,
          postback_url: 'https://example.com',
          capture: false,
          card_hash: payment.credit_card_hash
        )
      end
    end

    context 'when payment_method is boleto' do
      let(:payment) { create(:billing_payment, :boleto) }

      it 'returns boleto transaction params' do
        expect(result).to eq(
          reference_key: payment.id,
          payment_method: Billing::PaymentMethods::BOLETO,
          amount: payment.total_amount_cents,
          installments: payment.installments_count,
          async: false,
          postback_url: 'https://example.com',
          boleto_rules: ['strict_expiration_date'],
          customer: {
            name: payment.user.name,
            type: payment.user.account_type == 'pf' ? 'individual' : 'corporation',
            documents: [
              {
                type: payment.user.account_type == 'pf' ? 'cpf' : 'cnpj',
                number: payment.user.unformatted_document
              }
            ]
          }
        )
      end
    end

    context 'when payment_method is pix' do
      let(:payment) { create(:billing_payment, payment_method: 'pix') }

      it 'returns pix transaction params' do
        expect(result).to eq(
          reference_key: payment.id,
          payment_method: Billing::PaymentMethods::PIX,
          amount: payment.total_amount_cents,
          installments: payment.installments_count,
          async: false,
          postback_url: 'https://example.com',
          pix_expiration_date: 4.days.from_now.to_date.iso8601,
          customer:
          {
            external_id: payment.user.id.to_s,
            country: 'br',
            email: payment.user.email,
            phone_numbers: [
              '+55085999999999'
            ],
            name: payment.user.name,
            type: payment.user.account_type == 'pf' ? 'individual' : 'corporation',
            documents: [
              {
                type: payment.user.account_type == 'pf' ? 'cpf' : 'cnpj',
                number: payment.user.unformatted_document
              }
            ]
          }
        )
      end
    end
  end
end
