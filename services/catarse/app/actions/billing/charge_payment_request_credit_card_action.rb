module Billing
  class ChargePaymentRequestCreditCardAction
    extend LightService::Action

    expects :payment_request

    executed do |context|
      # TODO
    end
  end
end
