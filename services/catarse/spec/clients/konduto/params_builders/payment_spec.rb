# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Konduto::ParamsBuilders::Payment, type: :params_builder do
  subject(:params_builder) { described_class.new(payment) }

  let(:payment) { Billing::Payment.new(payment_attributes) }
  let(:payment_attributes) { {} }

  describe 'ATTRIBUTES constant' do
    it 'returns params attributes' do
      expect(described_class::ATTRIBUTES).to eq %i[
        type status bin last4 amount expiration_date
      ]
    end
  end

  describe '#build' do
    let(:payment) { create(:credit_card_payment) }

    it 'returns all attributes with corresponding methods results' do
      expect(params_builder.build).to eq(
        type: params_builder.type,
        status: params_builder.status,
        bin: params_builder.bin,
        last4: params_builder.last4,
        amount: params_builder.amount,
        expiration_date: params_builder.expiration_date
      )
    end
  end

  describe '#type' do
    it 'returns `credit`' do
      expect(params_builder.type).to eq 'credit'
    end
  end

  describe '#status' do
    context 'when payment is authorized' do
      before { allow(payment).to receive(:in_state?).with(:authorized).and_return(true) }

      it 'returns `approved`' do
        expect(params_builder.status).to eq 'approved'
      end
    end

    context 'when payment isn`t authorized' do
      before { allow(payment).to receive(:in_state?).with(:authorized).and_return(false) }

      it 'returns `declined`' do
        expect(params_builder.status).to eq 'declined'
      end
    end
  end

  describe '#bin' do
    let(:credit_card) { Billing::CreditCard.new(bin: Faker::Number.number(digits: 6).to_s) }
    let(:payment_attributes) { { credit_card: credit_card } }

    it 'returns credit card bin' do
      expect(params_builder.bin).to eq credit_card.bin
    end
  end

  describe '#last4' do
    let(:credit_card) { Billing::CreditCard.new(last_digits: Faker::Number.number(digits: 4).to_s) }
    let(:payment_attributes) { { credit_card: credit_card } }

    it 'returns credit card last digits' do
      expect(params_builder.last4).to eq credit_card.last_digits
    end
  end

  describe '#amount' do
    let(:payment_attributes) { { total_amount_cents: Faker::Number.number(digits: 4) } }

    it 'returns payment total amount as decimal' do
      expect(params_builder.amount).to eq payment.total_amount.to_f
    end
  end

  describe '#expiration_date' do
    let(:credit_card) { Billing::CreditCard.new(expires_on: Faker::Time.forward(days: 1800).to_date) }
    let(:payment_attributes) { { credit_card: credit_card } }

    it 'returns credit card expires on MMYYYY format' do
      expect(params_builder.expiration_date).to eq credit_card.expires_on.strftime('%m%Y')
    end
  end
end
