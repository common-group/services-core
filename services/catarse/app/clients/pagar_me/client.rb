# frozen_string_literal: true

module PagarMe
  class Client
    require 'faraday'
    require 'faraday_middleware'
    include HTTParty

    base_uri 'https://api.pagar.me/1/'

    def find_transaction(transaction_id)
      response = connection.post("https://api.pagar.me/1/transactions/#{transaction_id}") do |req|
        req.body = { api_key: api_key }.to_json
      end

      response.body
    end

    def create_transaction(transaction_params)
      # TODO: handler errors (Timeout, internal server error)
      response = connection.post('https://api.pagar.me/1/transactions') do |req|
        req.body = transaction_params.merge(api_key: api_key).to_json
      end

      response.body
    end

    def capture_transaction(transaction_id)
      response = connection.post("https://api.pagar.me/1/transactions/#{transaction_id}/capture") do |req|
        req.body = { api_key: api_key }.to_json
      end

      unless response.success?
        error_options = { level: :fatal, extra: { data: response.parsed_response } }
        Sentry.capture_message('Transaction cannot be captured on gateway', error_options)
      end

      response.body
    end

    def refund_transaction(transaction_id)
      response = self.class.post("/transactions/#{transaction_id}/refund", body: { api_key: api_key })

      unless response.success?
        error_options = { level: :fatal, extra: { data: response.parsed_response } }
        Sentry.capture_message('Transaction cannot be refunded on gateway', error_options)
      end

      response
    end

    def list_transaction_payables(transaction_id)
      response = self.class.get("/transactions/#{transaction_id}/payables", body: { api_key: api_key })
      response.parsed_response
    end

    private

    def connection
      Faraday.new(headers: { 'Content-Type' => 'application/json' }) do |conn|
        conn.request :json
        conn.response :json
      end
    end

    def api_key
      # TODO: Get api key from Vault
      @api_key ||= CatarseSettings.get_without_cache(:pagarme_test_api_key)
    end
  end
end
