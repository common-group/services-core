# frozen_string_literal: true

module Billing
  class InstallmentSimulator
    def self.calculate(amount)
      max_installments = CatarseSettings.get_without_cache(:pagarme_max_installments).to_i
      interest_rate = CatarseSettings.get_without_cache(:pagarme_interest_rate).to_f
      (2..max_installments).map do |i|
        total_amount = amount.to_i * (1 + interest_rate * i / 100)
        installment_amount = total_amount / i
        {
          installments_count: i,
          total_amount_cents: total_amount.round(0),
          installment_amount_cents: installment_amount.round(0)
        }
      end
    end
  end
end
