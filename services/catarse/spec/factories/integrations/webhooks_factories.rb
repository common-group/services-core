FactoryGirl.define do
  factory :webhook, class: 'Integrations::Webhook' do
    provider { Integrations::Webhook.providers.values.sample }
    body { Hash[*Faker::Lorem.words(8)] }
    headers { Hash[*Faker::Lorem.words(8)] }
    state { Integrations::Webhook.aasm.states.map(&:name).sample }
  end
end
