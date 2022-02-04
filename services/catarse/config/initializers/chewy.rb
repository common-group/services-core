# frozen_string_literal: true

require 'faraday_middleware/aws_sigv4'

Chewy.settings = if Rails.env.production?
  {
    host: CatarseSettings.get_without_cache(:aws_elasticsearch_host),
    port: CatarseSettings.get_without_cache(:aws_elasticsearch_port),
    transport_options: {
      headers: {
        authorization: CatarseSettings.get_without_cache(:aws_elasticsearch_authorization),
        content_type: 'application/json'
      }
    }
  }
else
  { host: 'elasticsearch:9200' }
end

Chewy.logger = Logger.new($stdout)
Chewy.use_after_commit_callbacks = !Rails.env.test?
