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
        reduce_if(->(context) { context.payment_request.bank_slip? }, [
          GenerateBankSlip
        ]),
        reduce_if(->(context) { context.payment_request.credit_card? }, [
          AuthorizePayment,
          AnalyzePayment,
          CapturePayment
        ]),

      ]
    end
  end
end
