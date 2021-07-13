# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Integrations::Webhooks::ValidateSignature, type: :action do
  describe 'inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(attributes: { type: Hash }) }
    it { is_expected.to include(raw_data: { type: String }) }
  end

  describe 'outputs' do
    subject { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    subject(:result) { described_class.result(attributes: attributes, raw_data: raw_data) }

    let(:attributes) { attributes_for(:integrations_webhook, state: nil).slice(:body, :headers, :provider) }
    let(:raw_data) { Faker::Lorem.paragraph }
    let(:signature_validator) do
      Integrations::WebhookProviders.provider_object(attributes[:provider]).signature_validator
    end

    it 'validates webhook signature' do
      expect(signature_validator).to receive(:valid?)
        .with(body: attributes[:body], headers: attributes[:headers], raw_data: raw_data)

      result
    end

    context 'when webhook signature is valid' do
      before do
        allow(signature_validator).to receive(:valid?)
          .with(body: attributes[:body], headers: attributes[:headers], raw_data: raw_data)
          .and_return(true)
      end

      it { is_expected.to be_success }
    end

    context 'when webhook signature is invalid' do
      before do
        allow(signature_validator).to receive(:valid?)
          .with(body: attributes[:body], headers: attributes[:headers], raw_data: raw_data)
          .and_return(false)
      end

      it { is_expected.to be_failure }

      it 'sends message error to Sentry' do
        data = { level: :fatal, extra: { data: attributes, raw_data: raw_data } }
        expect(Sentry).to receive(:capture_message).with('Invalid webhook signature', data)

        result
      end
    end
  end
end
