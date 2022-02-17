# frozen_string_literal: true

class ProjectScoreStorage < ApplicationRecord
  belongs_to :project

  update_index('projects') { project }
end
