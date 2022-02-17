# frozen_string_literal: true

FactoryBot.define do
  factory :tag do
    name { generate(:name) }
    slug { generate(:name) }
  end
end
