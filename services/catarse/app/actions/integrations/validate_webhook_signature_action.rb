module Integrations
  class ValidateWebhookSignatureAction
    extend LightService::Action

    expects :provider
    expects :body
    expects :headers
    expects :raw_data

    executed do |context|
      signature_validator = Integrations::Webhook::SIGNATURE_VALIDATORS[context.provider.to_s]

      if signature_validator.valid?(body: context.body, headers: context.headers, raw_data: context.raw_data)
        next context
      else
        Raven.capture_message(
          'Webhook invalid signature',
          level: :error,
          extra: { provider: context.provider, body: context.body, headers: context.headers }
        )

        context.fail_and_return!('Invalid signature')
      end
    end
  end
end
