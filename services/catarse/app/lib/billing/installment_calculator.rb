# frozen_string_literal: true

module Billing
  class InstallmentCalculator
    attr_reader :interest_rate, :minimum_amount_for_installment, :max_allowed_installments

    class << self
      delegate :calculate, :simulations, :calculate_total_amount, :calculate_interest_amount, to: :new
    end

    def initialize
      @interest_rate = CatarseSettings.get_without_cache(:pagarme_interest_rate).to_f
      @max_allowed_installments = CatarseSettings.get_without_cache(:pagarme_max_installments).to_i
      @minimum_amount_for_installment =
        CatarseSettings.get_without_cache(:pagarme_minimum_value_for_installment).to_i * 100
    end

    def calculate(amount:, installments_count:)
      return if amount < minimum_amount_for_installment || installments_count > max_allowed_installments

      simulation_for_installment(amount: amount, installments_count: installments_count)
    end

    def simulations(amount:)
      max_installments = amount < minimum_amount_for_installment ? 1 : max_allowed_installments

      (1..max_installments).index_with do |installments_count|
        simulation_for_installment(amount: amount, installments_count: installments_count)
      end
    end

    def calculate_total_amount(amount:, installments_count:)
      if installments_count == 1 || amount < @minimum_amount_for_installment
        amount
      else
        (amount * (1 + interest_rate * installments_count / 100)).round(0)
      end
    end

    def calculate_interest_amount(amount:, installments_count:)
      total_amount = calculate_total_amount(amount: amount, installments_count: installments_count)
      total_amount - amount
    end

    private

    def simulation_for_installment(amount:, installments_count:)
      total_amount = calculate_total_amount(amount: amount, installments_count: installments_count)
      installment_amount = total_amount / installments_count
      {
        installments_count: installments_count,
        total_amount_cents: total_amount.round(0),
        installment_amount_cents: installment_amount.round(0)
      }
    end
  end
end
