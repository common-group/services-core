# frozen_string_literal: true

FactoryBot.define do
  trait :with_fake_id do
    id { Faker::Internet.uuid }
  end
end
