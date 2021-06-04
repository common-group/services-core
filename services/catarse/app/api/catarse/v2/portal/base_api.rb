# frozen_string_literal: true

module Catarse
  module V2
    module Portal
      class BaseAPI < Grape::API
        namespace 'portal' do
          mount Catarse::V2::Portal::AuthTokensAPI
        end
      end
    end
  end
end
