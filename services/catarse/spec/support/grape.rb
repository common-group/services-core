module DefineGrapeApp
  def subject
    Catarse::BaseAPI
  end

  def app
    subject
  end
end

RSpec.configure do |config|
  config.include Rack::Test::Methods, type: :api
  config.include DefineGrapeApp, type: :api
end
