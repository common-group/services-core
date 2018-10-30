class AddressPolicy < ApplicationPolicy
  def create?
    user
  end

  # TODO update permissions
  def update?
    create
  end

  def destroy?
    create
  end

  def permitted_attributes
    [
      :state_id,
      :country_id,
      :external_id,
      :address_street,
      :address_number,
      :address_complement,
      :address_neighbourhood,
      :address_city,
      :address_zip_code,
      :address_state,
      :phone_number
    ]
  end
end
