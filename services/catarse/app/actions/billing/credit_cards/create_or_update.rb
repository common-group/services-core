# frozen_string_literal: true

module Billing
  module CreditCards
    class CreateOrUpdate < Actor
      input :user, type: User
      input :attributes, type: Hash
      input :pagar_me_client, type: PagarMe::Client, default: -> { PagarMe::Client.new }

      output :credit_card, type: Billing::CreditCard

      def call
        gateway_response = pagar_me_client.create_credit_card(card_hash: attributes[:hash])
        self.credit_card = find_or_create_credit_card(gateway_response)

        credit_card.update!(saved: attributes[:saved], billing_address_id: attributes[:billing_address_id])
      end

      private

      def find_or_create_credit_card(gateway_response)
        find_credit_card(gateway_response['id']) || create_credit_card(gateway_response)
      end

      def find_credit_card(gateway_id)
        Billing::CreditCard.find_by(gateway: Billing::Gateways::PAGAR_ME, gateway_id: gateway_id, user_id: user.id)
      end

      def create_credit_card(gateway_response)
        expiration_date = parse_expiration_date(gateway_response['expiration_date'])

        Billing::CreditCard.create!(
          user: user,
          billing_address_id: attributes[:billing_address_id],
          gateway: Billing::Gateways::PAGAR_ME,
          gateway_id: gateway_response['id'],
          holder_name: gateway_response['holder_name'],
          bin: gateway_response['first_digits'],
          last_digits: gateway_response['last_digits'],
          country: gateway_response['country'],
          brand: gateway_response['brand'],
          expires_on: expiration_date
        )
      end

      def parse_expiration_date(expiration_date)
        month, year = expiration_date.gsub(/\d{2}/).to_a
        "#{month}/20#{year}".to_date
      end
    end
  end
end
