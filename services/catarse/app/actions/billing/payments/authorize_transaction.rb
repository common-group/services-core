# frozen_string_literal: true

module Billing
  module Payments
    class AuthorizeTransaction < Actor
      include Helpers::ErrorHandler

      input :payment, type: Billing::Payment
      input :pagar_me_client, type: PagarMe::Client, default: -> { PagarMe::Client.new }

      def call
        response = pagar_me_client.create_transaction(transaction_params)

        transition_payment_state(response)

        payment.update!(gateway_id: response['id'])
      end

      private

      def transaction_params
        PagarMe::TransactionParamsBuilder.new(payment: payment).build
      end

      def transition_payment_state(response)
        case response['status']
        when 'authorized'
          payment.authorize!(response)
        when 'refused'
          payment.refuse!(response)
        else
          handle_fatal_error('Invalid gateway request',
            { data: response, payment_id: payment.id, user_id: payment.user_id }
          )
        end
      end
    end
  end
end
