# frozen_string_literal: true

FactoryBot.define do
  factory :project_score_storage do
    association :project, factory: :project
    score { 1 }
  end
end
