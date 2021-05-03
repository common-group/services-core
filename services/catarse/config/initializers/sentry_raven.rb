# frozen_string_literal: true

Raven.configure do |config|
  config.dsn = CatarseSettings.get_without_cache(:sentry_dsn) || ''
  config.secret_key = config.public_key
  config.environments = %w[sandbox production]
  config.sanitize_fields = Rails.application.config.filter_parameters.map(&:to_s)
end
