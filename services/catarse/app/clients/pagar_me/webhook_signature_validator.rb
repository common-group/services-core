# frozen_string_literal: true

module PagarMe
  class WebhookSignatureValidator
    def self.valid?(headers:, raw_data:, body: {})
      # TODO: Get api key from Vault
      api_key = CatarseSettings.get_without_cache(:pagarme_test_api_key)
      hash = OpenSSL::HMAC.hexdigest('sha1', api_key, raw_data)
      raw_signature = headers['X-Hub-Signature'].to_s.split('=').second

      hash == raw_signature
    end
  end
end
