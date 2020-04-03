module Integrations
  class Webhook < ActiveRecord::Base
    include Integrations::Concerns::WebhookStateMachine

    SIGNATURE_VALIDATORS = {
      'pagarme' => Billing::Gateways::Pagarme::WebhookSignatureValidator,
      'konduto' => Billing::Antifraud::Konduto::WebhookSignatureValidator
    }

    PROCESSORS = {
      'pagarme' => Billing::Gateways::Pagarme::WebhookProcessor,
      'konduto' => Billing::Antifraud::Konduto::WebhookProcessor
    }

    as_enum :provider, %w[pagarme konduto], map: :string, source: :provider

    has_many :state_transitions, class_name: 'Integrations::WebhookStateTransition', dependent: :destroy

    validates :provider, presence: true
    validates :state, presence: true
    validates :body, presence: true

    validates :provider, inclusion: { in: self.providers.values.map(&:to_sym) }
    validates :state, inclusion: { in: aasm.states.map(&:name).map(&:to_s) }
  end
end
