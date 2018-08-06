require "bundler/setup"
require "shoulda/matchers"
require "common_models"
require 'factory_bot'
require 'database_cleaner'
require 'pry'

Dir[File.join(File.dirname(__FILE__), "..", "lib" , "**.rb")].each do |f|
  require f
end

Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :active_record
    with.library :active_model
  end
end

RSpec.configure do |config|
  CommonModels.configure_with_url(ENV['TEST_DATABASE']) if ENV['TEST_DATABASE'].present?
  extend CommonModels
  # Enable flags like --only-failures and --next-failure
  config.example_status_persistence_file_path = ".rspec_status"

  # Disable RSpec exposing methods globally on `Module` and `main`
  config.disable_monkey_patching!

  config.expect_with :rspec do |c|
    c.syntax = :expect
  end

  config.include FactoryBot::Syntax::Methods

  config.before(:suite) do
    FactoryBot.find_definitions

    DatabaseCleaner.strategy = :transaction#, { except: %i[__diesel_schema_migrations] }
    DatabaseCleaner.clean_with(:truncation, { except: %w[__diesel_schema_migrations] })
  end

  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end

  config.after(:each) do
    DatabaseCleaner.clean
  end
end
