# frozen_string_literal: true

module Catarse
  module V2
    module Shared
      class BaseAPI < Grape::API
        namespace 'shared' do
          mount Catarse::V2::Shared::AddressesAPI
          mount Catarse::V2::Shared::CountriesAPI
        end
      end
    end
  end
end
