# frozen_string_literal: true

module Catarse
  module V2
    module Billing
      class InstallmentSimulationsAPI < Grape::API
        params do
          requires :total_amount_cents, type: Integer
        end

        get '/installment_simulations' do
          total_amount_cents = params['total_amount_cents']
          result = ::Billing::InstallmentSimulator.new.calculate(total_amount_cents)

          result
        end
      end
    end
  end
end
