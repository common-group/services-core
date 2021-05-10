# frozen_string_literal: true

module Konduto
  class Client
    include HTTParty

    base_uri 'https://api.konduto.com/v1'

    def create_order(order_params)
      # TODO: Get api key from Vault
      api_key = CatarseSettings.get_without_cache(:konduto_test_api_key)
      headers = { 'Authorization' => "Basic #{Base64.encode64(api_key)}" }
      response = self.class.post('/orders', headers: headers, body: order_params.to_json)
      response.parsed_response
    end
  end
end
