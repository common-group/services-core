# frozen_string_literal: true

module Catarse
  module V2
    module Shared
      class AddressesAPI < Grape::API
        params do
          requires :address, type: Hash do
            requires :country_code, type: String
            requires :line_1, type: String
            requires :city, type: String
            requires :state, type: String

            optional :postal_code, type: String
            optional :line_2, type: String
            optional :number, type: String
            optional :neighborhood, type: String
            optional :first_name, type: String
            optional :last_name, type: String
            optional :organization, type: String
          end
        end

        post '/addresses' do
          address_params = declared(params, include_missing: false)[:address]

          result = ::Shared::Addresses::Create.result(user: current_user, attributes: address_params)

          result.address
        end
      end
    end
  end
end
