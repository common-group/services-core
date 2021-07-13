# frozen_string_literal: true

module Integrations
  module Webhooks
    class ValidateSignature < Actor
      input :attributes, type: Hash
      input :raw_data, type: String

      def call
        signature_validator = provider_object.signature_validator

        return if signature_validator.valid?(body: attributes[:body], headers: attributes[:headers], raw_data: raw_data)

        extra = { data: attributes, raw_data: raw_data }
        Sentry.capture_message('Invalid webhook signature', level: :fatal, extra: extra)
        fail!(error: 'Invalid webhook signature')
      end

      def provider_object
        Integrations::WebhookProviders.provider_object(attributes[:provider])
      end
    end
  end
end
