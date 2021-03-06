# frozen_string_literal: true

FactoryBot.define do
  factory :unsubscribe do
    association :user, factory: :user
    association :project, factory: :project
  end
end
