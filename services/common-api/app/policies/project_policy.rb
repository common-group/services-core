class ProjectPolicy < ApplicationPolicy
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
    # @TODO remove state specific fields
    [:name, :mode, :platform_id, :permalink, :user_id] <<
    [data: [:service_fee, :about_html, :goal, :headline]]
  end

  private

  def is_project_owner?
    record.user_id == user.id
  end

  def is_platform_user?
    user.is_a?(CommonModels::Platform)
  end
end
