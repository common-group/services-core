# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::Common::CountriesAPI, type: :api do
  mock_request_authentication

  include_examples 'authenticate routes'

  describe 'GET /v2/common/countries' do
    let(:countries) { [{ 'code' => 'name' }] }

    before do
      allow(Common::Countries::List).to receive(:call).and_return(ServiceActor::Result.new(countries: countries))
    end

    it 'returns countries list' do
      get '/api/v2/common/countries'

      expect(response.body).to eq(countries.to_json)
    end

    it 'return status 200 - ok' do
      get '/api/v2/common/countries'

      expect(response).to have_http_status(:ok)
    end
  end
end
