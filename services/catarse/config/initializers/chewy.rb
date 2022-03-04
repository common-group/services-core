# frozen_string_literal: true

require 'faraday_middleware/aws_sigv4'

Chewy.settings = if Rails.env.production? || Rails.env.sandbox?
  {
    host: CatarseSettings.get_without_cache(:aws_elasticsearch_host),
    ca_fingerprint: CatarseSettings.get_without_cache(:aws_elasticsearch_ca_fingerprint),
    api_key: CatarseSettings.get_without_cache(:aws_elasticsearch_api_key),
    transport_options: {
      ssl: { verify: false },
      headers: {
        content_type: 'application/json'
      }
    },
    sidekiq: { queue: :low }
  }
else
  { host: 'elasticsearch:9200' }
end

Chewy.logger = Logger.new($stdout)
Chewy.use_after_commit_callbacks = !Rails.env.test?
Chewy.root_strategy    = :sidekiq
Chewy.request_strategy = :sidekiq
