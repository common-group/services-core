# frozen_string_literal: true

FactoryBot.define do
  factory :integrations_webhook, class: 'Integrations::Webhook' do
    provider { Integrations::WebhookProviders.list.sample }
    body { Hash[*Faker::Lorem.words(number: 8)] }
    headers { Hash[*Faker::Lorem.words(number: 8)] }

    state { Integrations::WebhookStateMachine.states.sample }
    traits_for_enum :state, Integrations::WebhookStateMachine.states
  end
end
