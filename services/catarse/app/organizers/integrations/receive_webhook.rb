module Integrations
  class ReceiveWebhook
    extend LightService::Organizer

    def self.call(context)
      with(context).reduce(actions)
    end

    def self.actions
      [
        ValidateWebhookSignatureAction,
        CreateWebhookAction,
        ProcessWebhookAction
      ]
    end
  end
end
