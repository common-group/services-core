# frozen_string_literal: true

module Helpers
  module ErrorHandler
    def handle_fatal_error(message, extra = {})
      Sentry.capture_message(message, level: :fatal, extra: extra)
      fail!(error: message)
    end
  end
end
