# frozen_string_literal: true

module Integrations
  class Webhook < ApplicationRecord
    include Utils::HasStateMachine

    has_enumeration_for :provider,
      with: Integrations::WebhookProviders,
      required: true,
      create_helpers: { polymorphic: true }

    validates :body, presence: true

    def processor
      @processor ||= provider_object.processor.new(webhook: self)
    end
  end
end
