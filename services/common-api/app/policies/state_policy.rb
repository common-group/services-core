class StatePolicy < ApplicationPolicy
  def create?
    is_platform_user?
  end

  def update?
    create
  end

  def destroy?
    create
  end

  def permitted_attributes
    [
      :country_id,
      :external_id,
      :name,
      :acronym,
      :created_at,
      :updated_at
    ]
  end
end
