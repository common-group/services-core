# frozen_string_literal: true

module Billing
  class Installments
    def self.calculate(amount)
      max_installments ||= CatarseSettings.get_without_cache(:pagarme_max_installments).to_i
      interest_rate ||= CatarseSettings.get_without_cache(:pagarme_interest_rate).to_f
      installment_simulations = []
      (2..max_installments).each do |i|
        installment = i
        total_amount = amount.to_i * (1 + interest_rate * installment / 100)
        installment_amount = total_amount / i

        installment_simulations << {
          installments_count: installment,
          total_amount_cents: total_amount.round(0),
          installment_amount_cents: installment_amount.round(0)
        }
      end
      installment_simulations
    end
  end
end
