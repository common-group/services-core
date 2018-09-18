class RewardPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope_cond = { projects: {
                        platform_id: user.try(:platform_id)
                     }, user_id: user.id }
      scope_cond = { projects: { platform_id: user.id } } if is_platform_user?
      scope.joins(:project).where(scope_cond)
    end
  end

  def create?
    user.present? && project_is_from_platform? && user_is_from_platform?
  end

  def update?
    create?
  end

  def destroy?
    #@ TODO add check if any_sold
    false
  end

  def permitted_attributes
    # @TODO remove attributes based on project status
    [{ data: [:project_id, :minimum_value, :title, :description, :shipping_options,
              :welcome_message_body, :welcome_message_subject,
              :external_id, :current_ip, :maximum_contributions,
              :deliver_at, :row_order, :created_at] }]
  end

  private

  def project_is_from_platform?
    record.project.try(:platform_id) == current_platform_id
  end

  def user_is_from_platform?
    record.project.user.try(:platform_id) == current_platform_id
  end
end
