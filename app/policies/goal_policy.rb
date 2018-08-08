class GoalPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scoped = scope.joins(:project)

      if is_platform_user?
        scoped.where(projects: { platform_id: user.id })
      else
        scoped.where(projects: {
          platform_id: user.platform_id,
          user_id: user.id
        })
      end
    end
  end

  def create?
    project_is_from_platform? && (is_platform_user? || project_owner?)
  end

  def update?
    create?
  end

  def destroy?
    create?
  end

  def permitted_attributes
    %i[title description value]
  end

  def project_is_from_platform?
    record.project.try(:platform_id) == current_platform_id
  end

  private

  def project_owner?
    record.project.user_id == user.id
  end
end
