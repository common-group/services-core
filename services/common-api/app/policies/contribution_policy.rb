class ContributionPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scoped = scope.joins(:project)

      if is_platform_user?
        scoped.where(projects: { platform_id: user.id })
      else
        scoped.where(projects: {
                       platform_id: user.platform_id,
                       user_id: user.id
                     })
      end
    end
  end

  def create?
    user.present? && project_is_from_platform? && user_is_from_platform?
  end

  def update?
    create?
  end

  def destroy?
    false
  end

  def permitted_attributes
    [:value,
     :user_id,
     :reward_id,
     :project_id,
     :address_id,
     :platform_id,
     :shipping_fee_id,
     :origin_id,
     :external_id,
     :anonymous,
     :notified_finish,
     :payer_name,
     :payer_email,
     :payer_document,
     :payment_choice,
     :payment_service_fee,
     :referral_link,
     :card_owner_document,
     :delivery_status,
     :data,
     :deleted_at,
     :reward_sent_at,
     :reward_received_at,
     :survey_answered_at,
     :created_at,
     :updated_at
    ]
  end

  private

  def project_is_from_platform?
    record.project.try(:platform_id) == current_platform_id
  end

  def user_is_from_platform?
    record.project.user.try(:platform_id) == current_platform_id
  end
end
