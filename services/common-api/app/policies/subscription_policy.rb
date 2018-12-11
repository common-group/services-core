class SubscriptionPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scoped = scope

      if is_platform_user?
        scoped.where(platform_id: user.id)
      else
        scoped.where(
          platform_id: user.platform_id,
          user_id: user.id
        )
      end
    end
  end
 
  def create?
    user.present? && record_is_from_platform? && user_is_from_platform?
  end

  def update?
    create? && (is_platform_user? || is_owner?)
  end

  def destroy?
    false
  end

  def permitted_attributes
  end

  private

  def is_owner?
    record.user_id == user.id
  end

  def record_is_from_platform?
    record.try(:platform_id) == current_platform_id
  end

  def user_is_from_platform?
    record.user.try(:platform_id) == current_platform_id
  end
end
