# frozen_string_literal: true

module Catarse
  module V2
    module Common
      class BaseAPI < Grape::API
        namespace 'common' do
          mount Catarse::V2::Common::AddressesAPI
          mount Catarse::V2::Common::CountriesAPI
        end
      end
    end
  end
end
