module Billing
  module Payments
    class Checkout < Actor
      play Create
      play GenerateBoleto, if: ->(result) { result.payment.boleto? }
      play GeneratePix, if: ->(result) { result.payment.pix? }
      play AuthorizeTransaction, AnalyzeTransaction, CaptureOrRefundTransaction, if: lambda { |result|
        result.payment.credit_card?
      }
    end
  end
end
