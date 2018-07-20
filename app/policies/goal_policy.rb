class GoalPolicy < ApplicationPolicy
  def create?
    is_platform_user? || is_project_owner?
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

  private

  def is_project_owner?
    record.project.user_id == user.id
  end

  def is_platform_user?
    user.is_a?(CommonModels::Platform)
  end

  def is_admin?
    #user.user_roles.any? {|r| r.name == 'admin'}
  end
end
