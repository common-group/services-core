# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::BaseAPI, type: :api do
  mock_request_authentication

  subject(:api) { Class.new(described_class) }

  def app
    api
  end

  describe 'ActiveRecord::RecordInvalid' do
    before do
      api.get '/example' do
        payment = Billing::Payment.new
        payment.errors.add(:user_id, 'some error')

        raise ActiveRecord::RecordInvalid, payment
      end
    end

    it 'returns object errors as json' do
      get '/v2/example'

      expect(response.body).to eq({ errors: { user_id: ['some error'] } }.to_json)
    end

    it 'returns status 422 - unprocessable entity' do
      get '/v2/example'

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'ActiveRecord::RecordNotDestroyed' do
    before do
      api.get '/example' do
        payment = Billing::Payment.new
        payment.errors.add(:base, 'not destroyed error')

        raise ActiveRecord::RecordNotDestroyed.new('message', payment)
      end
    end

    it 'return object errors as json' do
      get '/v2/example'

      expect(response.body).to eq({ errors: { base: ['not destroyed error'] } }.to_json)
    end

    it 'returns status 403 - forbidden' do
      get '/v2/example'

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'Grape::Exceptions::ValidationErrors' do
    before do
      api.params do
        requires :some_param, type: String
      end

      api.get '/example' do
        'something'
      end
    end

    it 'return errors as json' do
      get '/v2/example'

      expect(response.body).to eq({ errors: ['some_param is missing'] }.to_json)
    end

    it 'return status 400 - bad request' do
      get '/v2/example'

      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'ActiveRecord::RecordNotFound' do
    before do
      api.get '/example' do
        raise ActiveRecord::RecordNotFound, 'not found'
      end
    end

    it 'return object errors as json' do
      get '/v2/example'

      expect(response.body).to eq({ error: 'not found' }.to_json)
    end

    it 'returns status 404 - not found' do
      get '/v2/example'

      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'Unexpected error' do
    before do
      api.get '/example' do
        raise 'some error'
      end
    end

    context 'when environment is production' do
      before { allow(Rails.env).to receive(:production?).and_return(true) }

      it 'returns errors as json' do
        get '/v2/example'

        expect(response.body).to eq({ error: 'Internal server error' }.to_json)
      end

      it 'returns status 500 - server error' do
        get '/v2/example'

        expect(response).to have_http_status(:server_error)
      end
    end

    context 'when environment isn`t production' do
      before { allow(Rails.env).to receive(:production?).and_return(false) }

      it 'raises error' do
        expect { get '/v2/example' }.to raise_error(StandardError)
      end
    end
  end
end
