class DirectMessagePolicy < ApplicationPolicy
  def create?
    user
  end

  def permitted_attributes
    [:user_id, :to_user_id, :project_id, :from_email, :from_name, :content,
     :data, :created_at, :updated_at]
  end
end
