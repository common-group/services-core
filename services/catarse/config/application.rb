# frozen_string_literal: true

require_relative 'boot'
require 'rails/all'
require 'sitemap_generator/tasks'

if defined?(Bundler)
  # If you precompile assets before deploying to production, use this line
  Bundler.require *Rails.groups(assets: %w[development test])
  # If you want your assets lazily compiled in production, use this line
  # Bundler.require(:default, :assets, Rails.env)
end

module Catarse
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 6.1

    config.to_prepare do
      Devise::Mailer.layout 'email' # email.haml or email.erb
      VideoInfo.provider_api_keys = { youtube: CatarseSettings[:youtube_key], vimeo: CatarseSettings[:vimeo_key] }

      Raven.configure do |config|
        config.dsn = CatarseSettings.get_without_cache(:sentry_dsn) || ''
        config.secret_key = config.public_key
        config.environments = %w[sandbox production]
        config.sanitize_fields = Rails.application.config.filter_parameters.map(&:to_s)
      end
    end

    config.paths['app/views'].unshift("#{Rails.root}/app/views/catarse_bootstrap")

    # NOTE: the custom view path is for build a new style without need to
    # edit the catarse_views
    # raise config.paths['app/views'].inspect
    config.paths['app/views'].unshift("#{Rails.root}/app/views/custom")

    config.active_record.schema_format = :sql

    # Since Rails 3.1, all folders inside app/ will be loaded automatically
    config.autoload_paths += %W[#{config.root}/lib #{config.root}/lib/**]

    # Default encoding for the server
    config.encoding = 'utf-8'

    config.filter_parameters += %i[password password_confirmation]
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

    # Enable the asset pipeline
    config.assets.enabled = true

    # Don't initialize the app when compiling
    config.assets.initialize_on_precompile = false

    # Version of your assets, change this if you want to expire all your assets
    config.assets.version = '1.0'

    config.assets.paths << "#{Rails.root}/node_modules"
    config.assets.paths << "#{Rails.root}"

    config.active_record.dump_schema_after_migration = true

    # Custom webpack-dev-server. Set it to true to use webpack-dev-server
    config.webpack_dev_server = false
  end
end
