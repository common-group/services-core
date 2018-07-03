require 'common_models'
class ApplicationController < Sinatra::Base
  extend CommonModels
  set :server, :thin

  def parse_json
    request.body.rewind
    @request_payload = JSON.parse request.body.read
  end

  after do
    ActiveRecord::Base.clear_active_connections!
  end
end
