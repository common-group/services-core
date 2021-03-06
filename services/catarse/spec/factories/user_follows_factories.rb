# frozen_string_literal: true

FactoryBot.define do
  factory :user_follow do
    association :user
    association :follow, factory: :user
  end
end
