# frozen_string_literal: true

module Catarse
  module V2
    module Billing
      class InstallmentSimulationsAPI < Grape::API
        params do
          requires :installment_simulations, type: Hash do
            requires :total_amount_cents, type: Integer
          end
        end

        post '/installment_simulations' do
          installment_simulations_params = declared(params, include_missing: false)[:installment_simulations]
          result = ::Billing::Installments.calculate(installment_simulations_params['total_amount_cents'])

          result
        end
      end
    end
  end
end
