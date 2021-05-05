# frozen_string_literal: true

module Billing
  class InstallmentSimulator
    attr_accessor :interest_rate, :max_installments, :minimum_value_for_installment

    def initialize
      @interest_rate = CatarseSettings.get_without_cache(:pagarme_interest_rate).to_f
      @max_installments = CatarseSettings.get_without_cache(:pagarme_max_installments).to_i
      @minimum_value_for_installment = CatarseSettings.get_without_cache(:pagarme_minimum_value_for_installment).to_i
    end

    def calculate(amount)
      @max_installments = 1 if amount < minimum_value_for_installment

      (1..@max_installments).map { |i| calculate_amount_for_installments(amount, i) }
    end

    private

    def calculate_amount_for_installments(amount, installment_count)
      total_amount = if installment_count == 1
        amount
      else
        amount * (1 + interest_rate * installment_count / 100)
      end
      installment_amount = total_amount / installment_count
      {
        installments_count: installment_count,
        total_amount_cents: total_amount.round(0),
        installment_amount_cents: installment_amount.round(0)
      }
    end
  end
end
