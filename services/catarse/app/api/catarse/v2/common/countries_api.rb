# frozen_string_literal: true

module Catarse
  module V2
    module Common
      class CountriesAPI < Grape::API
        get '/countries' do
          result = ::Common::Countries::List.result

          result.countries
        end
      end
    end
  end
end
