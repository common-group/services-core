# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::Common::CountriesAPI, type: :api do
  mock_request_authentication

  include_examples 'authenticate routes'

  describe 'GET /v2/common/countries' do
    it 'returns countries list' do
      get '/api/v2/common/countries'
      expected_response = { countries: Common::CountryEntity.represent(ISO3166::Country.all) }.to_json

      expect(response.body).to eq(expected_response)
    end

    it 'return status 200 - ok' do
      get '/api/v2/common/countries'

      expect(response).to have_http_status(:ok)
    end
  end
end
