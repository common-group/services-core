class UserApiKeyPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if is_platform_user?
        scope.where(platform_id: user.id)
      else
        scope.where(user_id: user.id, platform_id: user.platform_id)
      end
    end
  end

  def create?
    is_platform_user_and_owner? || is_owner?
  end

  def destroy?
    create?
  end

  private

  def is_project_owner?
    record.project.user_id == user.id
  end

  def is_admin?
    #user.user_roles.any? {|r| r.name == 'admin'}
  end
end
