# frozen_string_literal: true

FactoryBot.define do
  factory :tagging do
    association :project
    association :tag
  end
end
