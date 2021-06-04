# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::Shared::AddressesAPI, type: :api do
  mock_request_authentication

  include_examples 'authenticate routes'

  describe 'POST /v2/shared/addresses' do
    let(:address) { build(:shared_address) }
    let(:address_params) do
      {
        'country_code' => address.country_code,
        'line_1' => address.line_1,
        'city' => address.city,
        'state' => address.state
      }
    end

    before do
      allow(Shared::Addresses::Create).to receive(:result)
        .with(user: User.last, attributes: address_params)
        .and_return(ServiceActor::Result.new(address: address))
    end

    it 'returns created address' do
      post '/api/v2/shared/addresses', params: { address: address_params }

      expect(response.body).to eq(address.to_json)
    end

    it 'return status 201 - created' do
      post '/api/v2/shared/addresses', params: { address: address_params }

      expect(response).to have_http_status(:created)
    end
  end
end
