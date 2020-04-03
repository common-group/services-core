module Billing
  module Antifraud
    module Konduto
      class Client
        include HTTParty

        base_uri 'https://api.konduto.com/v1'
        debug_output Rails.logger

        class << self
          def api_key
            CatarseSettings.get_without_cache(Rails.env.production? ? :konduto_api_key : :konduto_test_api_key)
          end
        end

        def analyze_transaction(transaction_params: {})
          response = self.class.post('/orders', headers: headers, body: transaction_params.to_json)
          response.parsed_response.with_indifferent_access
        end

        private

        def headers
          { 'Authorization' => "Basic #{Base64.encode64(self.class.api_key) }", 'Content-Type' => 'application/json' }
        end
      end
    end
  end
end
