# frozen_string_literal: true

module Integrations
  module Webhooks
    class Receive < Actor
      play ValidateSignature, Create, DispatchProcessJob
    end
  end
end
