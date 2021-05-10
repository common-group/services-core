# frozen_string_literal: true

module Catarse
  module V2
    module Integrations
      class BaseAPI < Grape::API
        namespace 'integrations' do
          mount Catarse::V2::Integrations::WebhooksAPI
        end
      end
    end
  end
end
