# frozen_string_literal: true

FactoryBot.define do
  factory :project_metric_storage do
    association :project, factory: :project
    data { {} }
  end
end
