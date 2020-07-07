# frozen_string_literal: true

# This file is used by Rack-based servers to start the application.

require 'newrelic_rpm'
require 'new_relic/rack/developer_mode'
use NewRelic::Rack::DeveloperMode

require_relative 'config/environment'

run Catarse::Application
