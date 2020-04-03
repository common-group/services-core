module Billing
  module Antifraud
    module Konduto
      class WebhookSignatureValidator
        def self.valid?(body:, headers: {}, raw_data: '')
          api_key = Billing::Antifraud::Konduto::Client.api_key
          string = "#{body[:order_id]}##{body[:timestamp]}##{body[:status]}"
          hash = OpenSSL::HMAC.hexdigest('SHA256', api_key, string)

          hash == body[:signature]
        end
      end
    end
  end
end
