# frozen_string_literal: true

module Membership
  module Tiers
    class Create < Actor
      input :project_id, type: Integer
      input :attributes, type: Hash

      output :tier, type: Membership::Tier

      def call
        project = Project.find(project_id)
        self.tier = project.tiers.create!(attributes)
      end
    end
  end
end
