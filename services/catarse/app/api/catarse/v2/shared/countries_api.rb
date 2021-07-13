# frozen_string_literal: true

module Catarse
  module V2
    module Shared
      class CountriesAPI < Grape::API
        get '/countries' do
          result = ::Shared::Countries::List.result

          result.countries
        end
      end
    end
  end
end
