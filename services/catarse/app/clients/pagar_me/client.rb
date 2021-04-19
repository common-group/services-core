# frozen_string_literal: true

module PagarMe
  class Client
    include HTTParty

    base_uri 'https://api.pagar.me/1/'

    def create_transaction(transaction_params)
      # TODO: handler errors (Timeout, internal server error)
      response = self.class.post('/transactions', body: transaction_params.merge(api_key: api_key))
      response.parsed_response
    end

    def capture_transaction(transaction_id)
      response = self.class.post("/transactions/#{transaction_id}/capture", body: { api_key: api_key })

      unless response.success?
        error_options = { level: :fatal, extra: { data: response.parsed_response } }
        Sentry.capture_message('Transaction cannot be captured on gateway', error_options)
      end

      response.parsed_response
    end

    def refund_transaction(transaction_id)
      response = self.class.post("/transactions/#{transaction_id}/refund", body: { api_key: api_key })

      unless response.success?
        error_options = { level: :fatal, extra: { data: response.parsed_response } }
        Sentry.capture_message('Transaction cannot be refunded on gateway', error_options)
      end

      response.parsed_response
    end

    private

    def api_key
      # TODO: Get api key from Vault
      @api_key ||= CatarseSettings.get_without_cache(:pagarme_test_api_key)
    end
  end
end
