# frozen_string_literal: true

FactoryBot.define do
  factory :membership_tier, class: 'Membership::Tier' do
    association :project, factory: :subscription_project

    name { Faker::Lorem.sentence }
    description { Faker::Lorem.sentence(word_count: 20) }
    request_shipping_address { Faker::Boolean.boolean }
    subscribers_limit { nil }
    order { Faker::Number.number(digits: 1) }

    trait :with_thumbnail do
      thumbnail { File.open('spec/fixtures/files/testimg.png') }
    end
  end
end
