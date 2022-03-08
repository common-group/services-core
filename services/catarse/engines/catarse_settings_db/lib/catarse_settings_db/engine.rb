require 'rails/engine'
require_relative '../../app/models/catarse_settings_db/setting.rb'

module CatarseSettingsDb
  class Engine < Rails::Engine
    isolate_namespace CatarseSettingsDb

    initializer 'settings.environment', before: :load_config_initializers do |app|
      ::CatarseSettings = CatarseSettingsDb::Setting
    end
  end
end
