# frozen_string_literal: true

FactoryBot.define do
  factory :shipping_fee do
    association :reward
    destination { 'all' }
    value { 20 }
  end
end
