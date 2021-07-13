# frozen_string_literal: true

module APIAuthenticationMacro
  def mock_request_authentication
    let(:current_user) { build(:user, id: Faker::Internet.uuid) }

    before do
      Grape::Endpoint.before_each do |endpoint|
        allow(endpoint).to receive(:authenticate_request!).and_return(true)
        allow(endpoint).to receive(:current_user).and_return(current_user)
      end
    end

    after do
      Grape::Endpoint.before_each nil
    end
  end
end

RSpec.configure do |config|
  config.include RSpec::Rails::RequestExampleGroup, type: :api
  config.extend APIAuthenticationMacro, type: :api
end
