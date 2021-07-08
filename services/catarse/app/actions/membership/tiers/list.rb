# frozen_string_literal: true

module Membership
  module Tiers
    class List < Actor
      input :project_id, type: String

      output :tiers, type: Enumerable

      def call
        project = Project.find(project_id)

        self.tiers = project.tiers
      end
    end
  end
end
