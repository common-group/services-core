# frozen_string_literal: true

module Catarse
  module V2
    class BaseAPI < Grape::API
      format :json
      version :v2, using: :path

      helpers Catarse::V2::Helpers::AuthenticationHelpers
      helpers Catarse::V2::Helpers::RequestHelpers

      rescue_from ActiveRecord::RecordInvalid do |e|
        error!({ errors: e.record.errors.messages }, 422)
      end

      rescue_from ActiveRecord::RecordNotDestroyed do |e|
        error!({ errors: e.record.errors.messages }, 403)
      end

      rescue_from Grape::Exceptions::ValidationErrors do |e|
        error!({ errors: e.full_messages }, 400)
      end

      rescue_from ActiveRecord::RecordNotFound do |e|
        error!({ error: e.message }, 404)
      end

      rescue_from :all do |e|
        raise e unless Rails.env.production?

        Sentry.capture_exception(e)

        error!({ error: 'Internal server error' }, 500)
      end

      before do
        authenticate_request! unless public_route?
      end

      mount Catarse::V2::Billing::BaseAPI
      mount Catarse::V2::Integrations::BaseAPI
      mount Catarse::V2::Portal::BaseAPI
      mount Catarse::V2::Shared::BaseAPI
    end
  end
end
