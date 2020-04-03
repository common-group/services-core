module Billing
  module Gateways
    module Pagarme
      class WebhookSignatureValidator
        def self.valid?(body: {}, headers:, raw_data:)
          api_key = Client.api_key
          hash = OpenSSL::HMAC.hexdigest('sha1', api_key, raw_data)
          raw_signature = headers['X-Hub-Signature'].to_s.split('=').second

          hash == raw_signature
        end
      end
    end
  end
end
