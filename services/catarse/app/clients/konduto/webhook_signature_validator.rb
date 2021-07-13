# frozen_string_literal: true

module Konduto
  class WebhookSignatureValidator
    def self.valid?(body:, raw_data: '', headers: {})
      # TODO: Get api key from Vault
      api_key = CatarseSettings.get_without_cache(:konduto_test_api_key)
      data = "#{body['order_id']}##{body['timestamp']}##{body['status']}"
      digest = OpenSSL::Digest.new('sha256')

      hmac = OpenSSL::HMAC.hexdigest(digest, api_key, data)
      hmac == body['signature']
    end
  end
end
