# frozen_string_literal: true

begin
  if Rails.env.production?
    ActionMailer::Base.smtp_settings = {
      address: 'smtp.sendgrid.net',
      port: CatarseSettings.get_without_cache(:sendgrid_port),
      authentication: :plain,
      user_name: CatarseSettings.get_without_cache(:sendgrid_user_name),
      password: CatarseSettings.get_without_cache(:sendgrid),
      domain: 'heroku.com'
    }
    ActionMailer::Base.delivery_method = :smtp
  end
rescue StandardError
  nil
end

ActionMailer::Base.register_interceptor(SandboxMailInterceptor) if Rails.env.sandbox?
