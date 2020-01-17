module Billing
  class ProcessCheckout
    extend LightService::Organizer

    def self.call(payment_request_attributes:)
      with(payment_request_attributes: payment_request_attributes).reduce(actions)
    end

    private

    def self.actions
      [
        CreatePaymentRequestAction,
        ChargePaymentRequestAction
      ]
    end
  end
end
