require 'sentry-ruby'

if Rails.env.production? || Rails.env.sandbox?
  Sentry.init do |config|
    config.dsn = CatarseSettings.get_without_cache(:sentry_dsn) || ''
    # config.environments = %w[development sandbox production]
    # config.sanitize_fields = Rails.application.config.filter_parameters.map(&:to_s)
  end
end
