module Billing
  module Gateways
    module Pagarme
      class Client
        include HTTParty

        base_uri 'https://api.pagar.me/1'
        debug_output Rails.logger

        class << self
          def api_key
            CatarseSettings.get_without_cache(Rails.env.production? ? :pagarme_api_key : :pagarme_test_api_key)
          end
        end

        def create_transaction(transaction_params: {})
          request_body = transaction_params.merge(api_key: self.class.api_key)

          response = self.class.post('/transactions', body: request_body)
          response.parsed_response.with_indifferent_access
        end

        def capture_transaction(gateway_id:)
          response = self.class.post("/transactions/#{gateway_id}/capture", body: { api_key: self.class.api_key })

          unless response.success?
            error_options = { level: :fatal, extra: response.parsed_response }
            Raven.capture_message('Transaction cannot be captured on gateway', error_options)
          end

          response
        end

        def refund_transaction(gateway_id:)
          response = self.class.post("/transactions/#{gateway_id}/refund", body: { api_key: self.class.api_key })

          unless response.success?
            error_options = { level: :fatal, extra: response.parsed_response }
            Raven.capture_message('Transaction cannot be refunded on gateway', error_options)
          end

          response
        end

        def extract_credit_card_attributes(response)
          country = ISO3166::Country.find_country_by_name(response.dig(:card, :country))
          expiration_date = response.dig(:card, :expiration_date).insert(2, '/20').to_date
          {
            gateway: 'pagarme',
            gateway_id: response.dig(:card, :id),
            holder_name: response.dig(:card, :holder_name),
            first_digits: response.dig(:card, :first_digits),
            last_digits: response.dig(:card, :last_digits),
            country_code: country.try(:alpha2),
            brand: response.dig(:card, :brand),
            expires_on: expiration_date,
            metadata: response
          }
        end

        def extract_bank_slip_attributes(response)
          {
            gateway: 'pagarme',
            barcode: response[:boleto_barcode],
            url: response[:boleto_url],
            expires_on: response[:boleto_expiration_date].to_date,
            metadata: response
          }
        end
      end
    end
  end
end
