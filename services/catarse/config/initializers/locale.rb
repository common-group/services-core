# frozen_string_literal: true

# tell the I18n library where to find your translations
I18n.load_path += Dir[Rails.root.join('lib', 'locales', '*.{rb,yml}')]
I18n.load_path += Dir[Rails.root.join('config', 'locales', '**', '*.{rb,yml}')]

# set available locales from config/locales files
# uncomment to enable en translations
I18n.available_locales = [:en]
# I18n.available_locales = [:pt]

# set default locale to something other than :en
I18n.default_locale = :en
