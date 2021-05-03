# frozen_string_literal: true

module Billing
  module Payments
    class AuthorizeTransaction < Actor
      include Helpers::ErrorHandler

      input :payment, type: Billing::Payment
      input :pagarme_client, type: PagarMe::Client, default: -> { PagarMe::Client.new }

      def call
        response = pagarme_client.create_transaction(transaction_params)

        next_state = evalute_next_state(response)

        payment.transition_to!(next_state, response)
        payment.update!(gateway: 'pagarme', gateway_id: response['id'])
        create_credit_card(response)
      end

      private

      def transaction_params
        PagarMe::TransactionParamsBuilder.new(payment: payment).build
      end

      def evalute_next_state(response)
        case response['status']
        when 'authorized'
          :authorized
        when 'refused'
          :refused
        else
          handle_fatal_error('Invalid gateway request',
            { data: response, payment_id: payment.id, user_id: payment.user_id }
          )
        end
      end

      def create_credit_card(response)
        credit_card_data = response['card']
        expiration_date = parse_credit_card_expiration_date(credit_card_data['expiration_date'])

        payment.create_credit_card!(
          user: payment.user,
          gateway: payment.gateway,
          gateway_id: credit_card_data['id'],
          holder_name: credit_card_data['holder_name'],
          bin: credit_card_data['first_digits'],
          last_digits: credit_card_data['last_digits'],
          country: credit_card_data['country'],
          brand: credit_card_data['brand'],
          expires_on: expiration_date
        )
      end

      def parse_credit_card_expiration_date(expiration_date)
        month, year = expiration_date.gsub(/\d{2}/).to_a
        "#{month}/20#{year}".to_date
      end
    end
  end
end
