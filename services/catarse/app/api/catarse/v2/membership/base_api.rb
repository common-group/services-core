# frozen_string_literal: true

module Catarse
  module V2
    module Membership
      class BaseAPI < Grape::API
        namespace 'membership' do
          mount Catarse::V2::Membership::BillingOptionsAPI
          mount Catarse::V2::Membership::TiersAPI
        end
      end
    end
  end
end
