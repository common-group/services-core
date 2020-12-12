# frozen_string_literal: true

class FlexibleProjectObserver < ActiveRecord::Observer
  observe :flexible_project

  def from_waiting_funds_to_successful(flexible_project)
    notify_admin_that_project_is_successful(flexible_project)
    notify_users(flexible_project)
  end
  alias from_online_to_successful from_waiting_funds_to_successful

  def from_draft_to_online(flexible_project)
    project = flexible_project

    project.update(
      audited_user_name: project.user.name,
      audited_user_cpf: project.user.cpf,
      audited_user_phone_number: project.user.phone_number
    )
    ProjectMetricStorageRefreshWorker.perform_in(5.seconds, flexible_project.id)
  end

  private

  def notify_admin_that_project_is_successful(flexible_project)
    redbooth_user = User.find_by(email: CatarseSettings[:email_redbooth])
    flexible_project.notify_once(:redbooth_task, redbooth_user) if redbooth_user
  end

  def notify_users(flexible_project)
    flexible_project.payments.with_state('paid').each do |payment|
      payment.contribution
             .notify_to_contributor(:contribution_project_successful)
    end
  end
end
