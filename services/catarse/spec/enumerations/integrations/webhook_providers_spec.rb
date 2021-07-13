# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Integrations::WebhookProviders, type: :enumeration do
  describe '.list' do
    subject { described_class.list }

    it { is_expected.to include('pagar_me') }
    it { is_expected.to include('konduto') }
  end

  describe '.provider_object' do
    it 'returns a new instance from polymorphic provider object' do
      expect(described_class.provider_object('pagar_me')).to be_an_instance_of(Integrations::WebhookProviders::PagarMe)
    end
  end

  describe Integrations::WebhookProviders::PagarMe do
    subject(:provider_object) { described_class.new }

    describe '#signature_validator' do
      it 'returns pagar_me webhook signature validator' do
        expect(provider_object.signature_validator).to eq PagarMe::WebhookSignatureValidator
      end
    end

    describe '#processor' do
      it 'returns pagar_me webhook processor' do
        expect(provider_object.processor).to eq PagarMe::WebhookProcessor
      end
    end
  end

  describe Integrations::WebhookProviders::Konduto do
    subject(:provider_object) { described_class.new }

    describe '#signature_validator' do
      it 'returns konduto webhook signature validator' do
        expect(provider_object.signature_validator).to eq Konduto::WebhookSignatureValidator
      end
    end

    describe '#processor' do
      it 'returns konduto webhook processor' do
        expect(provider_object.processor).to eq Konduto::WebhookProcessor
      end
    end
  end
end
