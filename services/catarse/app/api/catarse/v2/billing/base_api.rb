# frozen_string_literal: true

module Catarse
  module V2
    module Billing
      class BaseAPI < Grape::API
        namespace 'billing' do
          mount Catarse::V2::Billing::InstallmentSimulationsAPI
          mount Catarse::V2::Billing::PaymentsAPI
        end
      end
    end
  end
end
