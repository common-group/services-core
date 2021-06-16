# frozen_string_literal: true

require 'sentry-ruby'

if Rails.env.production? || Rails.env.sandbox?
  Sentry.init do |config|
    config.dsn = CatarseSettings.get_without_cache(:sentry_dsn)
  end
end
