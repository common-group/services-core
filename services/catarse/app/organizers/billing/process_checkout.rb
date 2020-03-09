module Billing
  class ProcessCheckout
    extend LightService::Organizer

    def self.call(context)
      with(context).reduce(actions)
    end

    def self.actions
      [
        CreatePaymentRequestAction,

        reduce_if(->(context) { context[:payment_request].bank_slip? }, [
          GenerateBankSlipAction
        ]),

        reduce_if(->(context) { context[:payment_request].credit_card? }, [
          AuthorizeTransactionAction,
          AnalyzeTransactionAction,
          CaptureOrRefundTransactionAction
        ])
      ]
    end
  end
end
