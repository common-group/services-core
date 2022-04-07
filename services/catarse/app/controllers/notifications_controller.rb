# frozen_string_literal: true

class NotificationsController < ApplicationController
  def show
    raise Pundit::NotAuthorizedError unless current_user
    @notification = kclass.find(params[:notification_id])
    raise Pundit::NotAuthorizedError unless current_user.admin || current_user == @notification.user

    render "catarse_bootstrap/user_notifier/mailer/#{@notification.template_name}", locals: { notification: @notification }, layout: 'catarse_bootstrap/layouts/email'
  end

  private

  def kclass
    @kclass ||= params[:notification_type].camelize.singularize.constantize
  end
end
