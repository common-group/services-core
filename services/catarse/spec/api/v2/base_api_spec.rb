require 'rails_helper'

RSpec.describe Catarse::V2::BaseAPI, type: :api do
  subject { Class.new(described_class) }

  def app
    subject
  end

  describe 'Configuration' do
    it 'has json format' do
      expect(described_class.format).to eq :json
    end

    it 'has v2 as version' do
      expect(described_class.version).to eq :v2
    end
  end

  describe 'Mounted apps' do
    subject { described_class.routes.map(&:path) }

    describe 'Billing apps' do
      it 'mounts Catarse::V2::Billing::PaymentRequestsAPI app' do
        is_expected.to include(*Catarse::V2::Billing::PaymentRequestsAPI.routes.map(&:path))
      end
    end
  end

  describe 'Rescued errors' do
    context 'when ActiveRecord::RecordInvalid is raised' do
      before do
        subject.get '/example' do
          user = User.new
          user.errors.add(:name, 'some error')
          raise ActiveRecord::RecordInvalid, user
        end
      end

      it 'formats params errors as json' do
        get '/v2/example'
        expect(last_response.body).to eq({ errors: { name: ['some error'] } }.to_json)
      end

      it 'responds with 422 http code' do
        get '/v2/example'
        expect(last_response.status).to eq Rack::Utils::SYMBOL_TO_STATUS_CODE[:unprocessable_entity]
      end
    end

    context 'when ActiveRecord::RecordNotDestroyed is raised' do
      before do
        subject.get '/example' do
          user = User.new
          user.errors.add(:base, 'some error')
          raise ActiveRecord::RecordNotDestroyed.new('message', user)
        end
      end

      it 'formats params errors as json' do
        get '/v2/example'
        expect(last_response.body).to eq({ errors: { base: ['some error'] } }.to_json)
      end

      it 'responds with 409 http code' do
        get '/v2/example'
        expect(last_response.status).to eq Rack::Utils::SYMBOL_TO_STATUS_CODE[:conflict]
      end
    end

    context 'when Grape::Exceptions::ValidationErrors is raised' do
      before do
        subject.params do
          requires :required_param, type: String
        end

        subject.get '/example' do
          raise Grape::Exceptions::ValidationErrors
        end
      end

      it 'formats params errors as json' do
        get '/v2/example'
        expect(last_response.body).to eq({ errors: ['required_param is missing'] }.to_json)
      end

      it 'responds with 400 http code' do
        get '/v2/example'
        expect(last_response.status).to eq Rack::Utils::SYMBOL_TO_STATUS_CODE[:bad_request]
      end
    end

    context 'when ActiveRecord::RecordNotFound is raised' do
      before do
        subject.get '/example' do
          raise ActiveRecord::RecordNotFound, 'not found'
        end
      end

      it 'format error as json' do
        get '/v2/example'
        expect(last_response.body).to eq({ error: 'not found' }.to_json)
      end

      it 'responds with 404 http code' do
        get '/v2/example'
        expect(last_response.status).to eq Rack::Utils::SYMBOL_TO_STATUS_CODE[:not_found]
      end
    end

    context 'when an unexpected exception is raised' do
      before do
        subject.get '/example' do
          raise 'Some error'
        end
      end

      context 'when environment isn`t development' do
        it 'format error as json' do
          get '/v2/example'
          expect(last_response.body).to eq({ error: 'Internal server error' }.to_json)
        end

        it 'responds with 500 http code' do
          get '/v2/example'
          expect(last_response.status).to eq Rack::Utils::SYMBOL_TO_STATUS_CODE[:internal_server_error]
        end
      end

      context 'when environment is development' do
        it 'raises error' do
          Rails.env = 'development'
          expect { get '/v2/example' }.to raise_error(RuntimeError)
          Rails.env = 'test'
        end
      end

      context 'when environemnt is production' do
        it 'doesn`t raise error' do
          Rails.env = 'production'
          expect { get '/v2/example' }.to_not raise_error
          Rails.env = 'test'
        end
      end
    end
  end
end
