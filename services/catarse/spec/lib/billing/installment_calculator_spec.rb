# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::InstallmentCalculator, type: :lib do
  let(:interest_rate) { 2.49 }
  let(:max_allowed_installments) { 6 }
  let(:minimum_amount_for_installment) { 10 }

  before do
    allow(CatarseSettings).to receive(:get_without_cache)
      .with(:pagarme_interest_rate).and_return(interest_rate)
    allow(CatarseSettings).to receive(:get_without_cache)
      .with(:pagarme_max_installments).and_return(max_allowed_installments)
    allow(CatarseSettings).to receive(:get_without_cache)
      .with(:pagarme_minimum_value_for_installment).and_return(minimum_amount_for_installment)
  end

  describe '#calculate' do
    subject(:result) { described_class.new.calculate(amount: amount, installments_count: installments_count) }

    let(:amount) { 2000 }
    let(:installments_count) { 4 }

    context 'when amount is less than minimun amount for installment' do
      let(:amount) { 9.99 }

      it { is_expected.to be_nil }
    end

    context 'when installments_count is greater than max allowed installments' do
      let(:installments_count) { 20 }

      it { is_expected.to be_nil }
    end

    it 'returns installment simulation for given amount and installment count' do
      expect(result).to eq(
        installments_count: 4,
        total_amount_cents: 2199,
        installment_amount_cents: 549
      )
    end
  end

  describe '#simulations' do
    subject(:result) { described_class.new.simulations(amount: amount) }

    let(:amount) { 2000 }

    context 'when amount is less than minimum amount for installment' do
      let(:amount) { 800 }

      it 'returns just lump sum payment simulation' do
        expect(result).to eq(
          1 => {
            installments_count: 1,
            total_amount_cents: 800,
            installment_amount_cents: 800
          }
        )
      end
    end

    context 'when amount is allowed to installment' do
      it 'returns simulations for each installment count' do
        expect(result.keys).to eq [1, 2, 3, 4, 5, 6]
      end

      it 'calculates total amount applying interest rate for each installment count' do
        total_amounts = result.map { |_i, simulation| simulation[:total_amount_cents] }
        expect(total_amounts).to eq [2000, 2100, 2149, 2199, 2249, 2299]
      end

      it 'calculates each installment amount' do
        installments_amounts = result.map { |_i, simulation| simulation[:total_amount_cents] }

        expect(installments_amounts).to eq [2000, 2100, 2149, 2199, 2249, 2299]
      end
    end
  end

  describe '#calculate_total_amount' do
    subject(:result) do
      described_class.new.calculate_total_amount(amount: amount, installments_count: installments_count)
    end

    let(:amount) { 2000 }
    let(:installments_count) { 6 }

    context 'when installments amount is 1' do
      let(:amount) { Faker::Number.number(digits: 4) }
      let(:installments_count) { 1 }

      it 'returns amount without applying interest' do
        expect(result).to eq amount
      end
    end

    context 'when amount is less than minimum amount for installment' do
      let(:amount) { 500 }

      it 'returns amount without applying interest' do
        expect(result).to eq 500
      end
    end

    context 'when installments amount is greater than one and amount is allowed to installment' do
      it 'returns total amount with interest applied' do
        expect(result).to eq 2299
      end
    end
  end

  describe '#calculate_interest_amount' do
    subject(:result) do
      described_class.new.calculate_interest_amount(amount: amount, installments_count: installments_count)
    end

    let(:amount) { 2000 }
    let(:installments_count) { 6 }

    it 'returns installment interest' do
      expect(result).to eq 299
    end
  end
end
