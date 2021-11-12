# frozen_string_literal: true

module Catarse
  module V2
    module Common
      class CountriesAPI < Grape::API
        get '/countries' do
          present :countries, ISO3166::Country.all, with: ::Common::CountryEntity
        end
      end
    end
  end
end
