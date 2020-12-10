# frozen_string_literal: true

module ProjectSpecHelpers
  # helper to handle with project creation with transitions
  def create_project(project_attr, transition_attr)
    project = create(:project, project_attr)
    project.project_transitions.destroy_all
    if transition_attr.present?
      if transition_attr.is_a?(Array)
        transition_attr.each do |t_attr|
          create(:project_transition, t_attr.merge!(project: project))
        end
      else
        create(:project_transition, transition_attr.merge!(project: project))
      end
    end
    project.update_expires_at
    project.save
    project.reload
  end
end
