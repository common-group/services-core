require "bundler/setup"
require "shoulda/matchers"
require "common_models"
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
  CommonModels.configure_with_url(ENV['TEST_DATABASE'])
  extend CommonModels
  # Enable flags like --only-failures and --next-failure
  config.example_status_persistence_file_path = ".rspec_status"

  # Disable RSpec exposing methods globally on `Module` and `main`
  config.disable_monkey_patching!

  config.expect_with :rspec do |c|
    c.syntax = :expect
  end
end
