# frozen_string_literal: true

module Membership
  module Tiers
    class Create < Actor
      input :project_id, type: Integer
      input :attributes, type: Hash

      output :tier, type: Membership::Tier

      def call
        project = Project.find(project_id)
        self.tier = project.tiers.create!(attributes.merge(order: 5))
      end
    end
  end
end
