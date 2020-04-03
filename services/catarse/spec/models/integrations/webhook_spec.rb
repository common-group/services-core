require 'rails_helper'

RSpec.describe Integrations::Webhook, type: :model do
  describe 'Relations' do
    it do
      is_expected.to have_many(:state_transitions)
        .class_name('Integrations::WebhookStateTransition')
        .dependent(:destroy)
    end
  end

  describe 'Constants' do
    it 'has SIGNATURE_VALIDATORS constant' do
      expect(described_class::SIGNATURE_VALIDATORS).to eq(
        'pagarme' => Billing::Gateways::Pagarme::WebhookSignatureValidator,
        'konduto' => Billing::Antifraud::Konduto::WebhookSignatureValidator
      )
    end

    it 'has PROCESSORS constant' do
      expect(described_class::PROCESSORS).to eq(
        'pagarme' => Billing::Gateways::Pagarme::WebhookProcessor,
        'konduto' => Billing::Antifraud::Konduto::WebhookProcessor
      )
    end
  end

  describe 'Enums' do
    it 'has providers enum' do
      expect(described_class.providers.hash).to eq(
        'pagarme' => 'pagarme',
        'konduto' => 'konduto'
      )
    end
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:provider) }
    it { is_expected.to validate_presence_of(:state) }
    it { is_expected.to validate_presence_of(:body) }

    it { is_expected.to validate_inclusion_of(:provider).in_array(described_class.providers.values.map(&:to_sym)) }
    it { is_expected.to validate_inclusion_of(:state).in_array(described_class.aasm.states.map(&:name).map(&:to_s)) }
  end
end
