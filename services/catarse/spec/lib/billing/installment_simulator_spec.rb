# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::InstallmentSimulator, type: :lib do
  describe '.calculate' do
    subject(:simulations) { described_class.calculate(amount) }

    let(:amount) { 2000 }
    let(:max_installments) { 10 }
    let(:interest_rate) { 10 }

    before do
      allow(CatarseSettings).to receive(:get_without_cache).with(:pagarme_max_installments).and_return(max_installments)
      allow(CatarseSettings).to receive(:get_without_cache).with(:pagarme_interest_rate).and_return(interest_rate)
    end

    it 'returns simulations for each installment count' do
      installments_count = simulations.pluck(:installments_count)
      expect(installments_count).to eq [2, 3, 4, 5, 6, 7, 8, 9, 10]
    end

    it 'calculates total amount applying interest rate for each installment count' do
      total_amounts = simulations.pluck(:total_amount_cents)
      expect(total_amounts).to eq [2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800, 4000]
    end

    it 'calculates each installment amount applying interest rate' do
      installment_amounts = simulations.pluck(:installment_amount_cents)
      expect(installment_amounts).to eq [1200, 867, 700, 600, 533, 486, 450, 422, 400]
    end
  end
end
