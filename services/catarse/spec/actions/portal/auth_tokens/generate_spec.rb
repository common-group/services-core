# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Portal::AuthTokens::Generate, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(attributes: { type: Hash }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to include(auth_token: { type: String }) }
  end

  describe '#call' do
    subject(:result) { described_class.result(attributes: attributes) }

    let(:user) { create(:user) }

    context 'when credential is valid' do
      let(:attributes) { { email: user.email, password: user.password }.stringify_keys }

      it { is_expected.to be_success }

      it 'returns auth token' do
        payload = Portal::AuthToken.decode(auth_token: result.auth_token)

        expect(payload.first['user_id']).to eq user.id
      end
    end

    context 'when email is invalid' do
      let(:attributes) { { email: 'missing-email@example.com', password: user.password } }

      it { is_expected.to be_failure }

      it 'returns blank auth token' do
        expect(result.auth_token).to be_nil
      end

      it 'returns error message' do
        expect(result.error).to eq 'E-mail or password is invalid'
      end
    end

    context 'when password is invalid' do
      let(:attributes) { { email: user.email, password: 'wrong-password' } }

      it { is_expected.to be_failure }

      it 'returns blank auth token' do
        expect(result.auth_token).to be_nil
      end

      it 'returns error message' do
        expect(result.error).to eq 'E-mail or password is invalid'
      end
    end
  end
end
