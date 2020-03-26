module Billing
  class AuthorizeTransactionAction
    extend LightService::Action

    expects :payment_request

    executed do |context|
      response = gateway_client.create_transaction(transaction_params: transaction_params(context.payment_request))

      case response[:status]
      when 'authorized'
        context.payment_request.authorize!(metadata: response)
      when 'refused'
        context.payment_request.refuse!(metadata: response)
      else
        Raven.capture_message(
          'Invalid gateway request',
          level: :fatal,
          user: { id: context.payment_request.user_id },
          extra: response.merge(payment_request_id: context.payment_request.id)
        )
        context.fail_and_return!('An error occurred')
      end

      context.payment_request.update!(gateway: 'pagarme', gateway_id: response[:id])
      context.payment_request.create_credit_card!(gateway_client.extract_credit_card_attributes(response))
    end

    def self.gateway_client
      @@gateway_client ||= Billing::Gateways::Pagarme::Client.new
    end

    def self.transaction_params(payment_request)
      Billing::Gateways::Pagarme::TransactionParamsBuilder.new(payment_request).build
    end
  end
end
