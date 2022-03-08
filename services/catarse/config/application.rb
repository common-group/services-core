# frozen_string_literal: true

require_relative 'boot'

require 'rails'
# Pick the frameworks you want:
require 'active_model/railtie'
require 'active_job/railtie'
require 'active_record/railtie'
# require 'active_storage/engine'
require 'action_controller/railtie'
require 'action_mailer/railtie'
# require 'action_mailbox/engine'
# require 'action_text/engine'
require 'action_view/railtie'
require 'action_cable/engine'
# require "rails/test_unit/railtie"

require 'sitemap_generator/tasks'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Catarse
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0

    config.to_prepare do
      Devise::Mailer.layout 'email' # email.haml or email.erb
      VideoInfo.provider_api_keys = { youtube: CatarseSettings[:youtube_key], vimeo: CatarseSettings[:vimeo_key] }
    end

    config.active_record.schema_format = :sql

    # Since Rails 3.1, all folders inside app/ will be loaded automatically
    config.autoload_paths += %W[#{config.root}/lib #{config.root}/lib/**]

    # Default encoding for the server
    config.encoding = 'utf-8'

    config.time_zone = 'Brasilia'
    config.active_record.default_timezone = :utc

    I18n.config.enforce_available_locales = false
    config.generators do |g|
      g.test_framework :rspec, fixture: false, views: false
    end
    config.active_record.observers = %i[
      contribution_observer survey_observer payment_observer user_observer project_post_observer project_observer
      flexible_project_observer subscription_project_observer
    ]

    config.active_record.dump_schema_after_migration = true
  end
end
