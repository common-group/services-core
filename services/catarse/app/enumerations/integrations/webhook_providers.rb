# frozen_string_literal: true

module Integrations
  class WebhookProviders < EnumerateIt::Base
    associate_values(:pagar_me, :konduto)

    def self.provider_object(provider_name)
      provider_object_class_name = provider_name.camelize
      const_get(provider_object_class_name).new
    end

    class PagarMe
      def signature_validator
        ::PagarMe::WebhookSignatureValidator
      end

      def processor
        ::PagarMe::WebhookProcessor
      end
    end

    class Konduto
      def signature_validator
        ::Konduto::WebhookSignatureValidator
      end

      def processor
        ::Konduto::WebhookProcessor
      end
    end
  end
end
