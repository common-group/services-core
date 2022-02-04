# frozen_string_literal: true

class ProjectMetricStorage < ApplicationRecord
  belongs_to :project

  update_index('projects') { project }
end
