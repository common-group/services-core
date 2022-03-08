$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "catarse_settings_db/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "catarse_settings_db"
  s.version     = CatarseSettingsDb::VERSION
  s.authors     = ["Antônio Roberto Silva", "Diogo Biazus"]
  s.email       = ["forevertonny@gmail.com", "diogob@gmail.com"]
  s.homepage    = "http://github.com/catarse/catarse_settings_db"
  s.summary     = "Engine to store catarse settings in the database."
  s.description = "Provide a Settings class to be used in Catarse that will store all data on a table containing key/value pairs."

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]

  s.add_dependency "rails", ">= 4.1.1"

  s.add_development_dependency "pg"
  s.add_development_dependency "rspec-rails"
  s.add_development_dependency "shoulda"
  s.add_development_dependency "database_cleaner"
end
