class ReportPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope_cond = { projects: {
        platform_id: user.platform_id
      }, user_id: user.id }
      scope_cond = { projects: { platform_id: user.id } } if is_platform_user?
      scope.joins(:project).where(scope_cond)
    end
  end

  def create?
    user.present? && project_is_from_platform? && user_is_from_platform?
  end

  def project_is_from_platform?
    record.project.try(:platform_id) == current_platform_id
  end

  def user_is_from_platform?
    record.user.try(:platform_id) == current_platform_id
  end

  def permitted_attributes
    attrs = %i[reason email details data]
    attrs << :user_id if is_platform_user?
    attrs
  end
end
