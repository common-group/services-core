class CountryPolicy < ApplicationPolicy
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
      :external_id,
      :name,
      :translations
    ]
  end
end
