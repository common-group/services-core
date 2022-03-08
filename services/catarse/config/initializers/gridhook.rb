# frozen_string_literal: true

require_relative '../../lib/sendgrid_event_processor'

Gridhook.configure do |config|
  config.event_receive_path = '/sendgrid/event'

  config.event_processor = SendgridEventProcessor.new
end
