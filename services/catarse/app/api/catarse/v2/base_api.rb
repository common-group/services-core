
module Catarse
  module V2
    class BaseAPI < Grape::API
      version :v2, using: :path
      format :json

      helpers Catarse::V2::Helpers::RequestHelpers

      rescue_from ActiveRecord::RecordInvalid do |e|
        error!({ errors: e.record.errors.messages }, 422)
      end

      rescue_from ActiveRecord::RecordNotDestroyed do |e|
        error!({ errors: e.record.errors.messages }, 409)
      end

      rescue_from Grape::Exceptions::ValidationErrors do |e|
        error!({ errors: e.full_messages }, 400)
      end

      rescue_from ActiveRecord::RecordNotFound do |e|
        error!({ error: e.message }, 404)
      end

      rescue_from :all do |e|
        raise e if Rails.env.development?

        Raven.capture_exception(e)
        error!({ error: 'Internal server error' }, 500)
      end

      namespace 'billing' do
        mount Catarse::V2::Billing::PaymentRequestsAPI
      end

      namespace 'integrations' do
        mount Catarse::V2::Integrations::WebhooksAPI
      end
    end
  end
end
