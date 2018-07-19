class GoalPolicy < ApplicationPolicy
  def create?
    is_project_owner? #|| is_admin?
  end
  def permitted_attributes
    %i[title description value]
  end

  def is_project_owner?
    record.project.user_id == user.id
  end

  def is_admin?
    #user.user_roles.any? {|r| r.name == 'admin'}
  end
end
