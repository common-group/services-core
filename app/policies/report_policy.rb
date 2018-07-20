class ReportPolicy < ApplicationPolicy
  def create?
    @user
  end

  def permitted_attributes
    %i[reason email details data]
  end
end
