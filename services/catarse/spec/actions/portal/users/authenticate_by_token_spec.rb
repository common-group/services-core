# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Portal::Users::AuthenticateByToken, type: :actor do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(authorization_header: { type: String, allow_nil: true }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to include(user: { type: [NilClass, User] }) }
  end

  describe '#call' do
    subject(:result) { described_class.result(authorization_header: authorization_header) }

    let(:user) { create(:user) }
    let(:payload) { { user_id: user.id } }
    let(:expires_at) { 5.minutes.from_now }
    let(:auth_token) { Portal::AuthToken.encode(payload: payload, expires_at: expires_at) }
    let(:authorization_header) { "Basic #{auth_token}" }

    context 'when auth token is valid' do
      it { is_expected.to be_success }

      it 'decodes token and returns found user' do
        expect(result.user).to eq user
      end
    end

    context 'when auth token is invalid' do
      before { allow(Portal::AuthToken).to receive(:decode).and_raise(JWT::VerificationError) }

      it { is_expected.to be_failure }

      it 'returns error message' do
        expect(result.error).to eq 'Invalid auth token'
      end
    end

    context 'when auth token is expired' do
      let(:expires_at) { 5.minutes.ago }

      it { is_expected.to be_failure }

      it 'returns error message' do
        expect(result.error).to eq 'Invalid auth token'
      end
    end

    context 'when user_id from auth token payload is invalid' do
      let(:payload) { { user_id: 'missing-id' } }

      it { is_expected.to be_failure }

      it 'returns error message' do
        expect(result.error).to eq 'Invalid auth token'
      end
    end
  end
end
