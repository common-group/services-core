module Billing
  class ProcessCheckout
    extend LightService::Organizer

    def self.call(user:, payment_request_attributes:)
      with(user: user, payment_request_attributes: payment_request_attributes).reduce(actions)
    end

    def self.actions
      [
        CreatePaymentRequestAction,
        # reduce_if(->(context) { context.payment_request.bank_slip? }, [
        #   GenerateBankSlipAction
        # ]),
        # reduce_if(->(context) { context.payment_request.credit_card? }, [
        #   ChargePaymentRequestCreditCardAction
        # ]),
      ]
    end
  end
end
