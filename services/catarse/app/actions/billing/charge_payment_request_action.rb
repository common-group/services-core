module Billing
  class ChargePaymentRequestAction
    extend LightService::Action

    expects :payment_request

    executed do |context|
      gateway_processor.charge(context.payment_request)
    end

    private_class_method def self.gateway_processor
      # todo
    end
  end
end
