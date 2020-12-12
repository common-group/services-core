# frozen_string_literal: true
Rails.application.config.assets.paths << Rails.root.join('node_modules')

Rails.application.config.assets.precompile += %w[
  catarse_bootstrap/fonts.css
  catarse_bootstrap/catarse.css
  jquery.js
  jquery-ui.js
  analytics.js
  redactor.css
  redactor.js
  jquery/dist/jquery.js
  jquery-ui/jquery-ui.js
  api/catarse.js
  app/sign_up_form.js
]
