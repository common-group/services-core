module Billing
  class AnalyzeTransactionAction
    extend LightService::Action

    expects :payment_request

    executed do |context|
      next context if is_credit_card_in_safelist?(context.payment_request.credit_card.gateway_id)

      response = antifraud_client.analyze_transaction(transaction_params: transaction_params(context.payment_request))

      case response.dig(:order, :recommendation).upcase
      when 'APPROVE'
        context.payment_request.approve!(metadata: response)
      when 'DECLINE'
        context.payment_request.decline!(metadata: response)
      when 'REVIEW'
        context.payment_request.wait_review!(metadata: response)
      when 'NONE'
        next context
      else
        Raven.capture_message(
          'Invalid antifraud request',
          level: :fatal,
          user: { id: context.payment_request.user_id },
          extra: response.merge(payment_request_id: context.payment_request.id)
        )
        context.fail_and_return!('An error occurred')
      end
    end

    def self.antifraud_client
      Billing::Antifraud::Konduto::Client.new
    end

    def self.transaction_params(payment_request)
      Billing::Antifraud::Konduto::TransactionParamsBuilder.new(payment_request).build
    end

    def self.is_credit_card_in_safelist?(credit_card_gateway_id)
      Billing::CreditCard.safelist.where(gateway_id: credit_card_gateway_id).exists?
    end
  end
end
