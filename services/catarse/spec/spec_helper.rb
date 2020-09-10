# frozen_string_literal: true

RSpec.configure do |config|
  require 'zonebie'

  config.disable_monkey_patching!
  config.order = :random
  Kernel.srand config.seed
  timezone = Zonebie.set_random_timezone
  config.filter_run focus: true
  config.run_all_when_everything_filtered = true
  config.expect_with :rspec do |expectations|
    expectations.syntax = :expect
  end
  config.mock_with :rspec do |mocks|
    mocks.syntax = :expect
    mocks.verify_partial_doubles = true
  end
  config.default_formatter = 'doc' if config.files_to_run.one?

  config.before(:suite) do
    con = ActiveRecord::Base.connection
    con.execute %(
    SET client_min_messages TO warning;
    SET timezone TO 'utc';
    SET search_path TO "$user", public, "1", "postgrest";
    )
    current_user = con.execute('SELECT current_user;')[0]['current_user']
    con.execute %(ALTER USER #{current_user} SET search_path TO "$user", public, "1", "postgrest";)
    DatabaseCleaner.clean_with :truncation
    I18n.locale = :pt
    I18n.default_locale = :pt

    FakeWeb.register_uri(:get, 'http://vimeo.com/api/v2/video/17298435.json', response: fixture_path('vimeo_default_json_request.txt'))
    FakeWeb.register_uri(:get, 'http://vimeo.com/17298435', response: fixture_path('vimeo_default_request.txt'))
    FakeWeb.register_uri(:get, 'http://www.youtube.com/watch?v=Brw7bzU_t4c', response: fixture_path('youtube_request.txt'))
    con.execute %(
    SET statement_timeout TO 0;
    REFRESH MATERIALIZED VIEW statistics;
    REFRESH MATERIALIZED VIEW user_totals;
    )
    con.execute %{
    INSERT INTO public.project_states (state, state_order) VALUES
    ('deleted', 'archived'),
    ('rejected', 'created'),
    ('draft', 'created'),
    ('online', 'published'),
    ('waiting_funds', 'published'),
    ('failed', 'finished'),
    ('successful', 'finished');
    }
  end

  config.before(:each) do
    DatabaseCleaner.strategy = if RSpec.current_example.metadata[:type] == :feature
                                 :truncation
                               else
                                 :transaction
                               end
    DatabaseCleaner.start
    ActionMailer::Base.deliveries.clear
    RoutingFilter.active = false # Because this issue: https://github.com/svenfuchs/routing-filter/issues/36
    Sidekiq::Testing.fake!
  end

  config.after(:each) do
    DatabaseCleaner.clean
  end

  %i[controller feature].each do |spec_type|
    config.before(:each, type: spec_type) do
      %i[detect_old_browsers render_facebook_sdk render_facebook_like render_twitter].each do |method|
        allow_any_instance_of(ApplicationController).to receive(method)
      end
    end
  end

  # Stubs and configuration
  config.before(:each) do
    allow(Sidekiq::ScheduledSet).to receive(:new).and_return({})
    allow_any_instance_of(BankAccount).to receive(:must_be_valid_on_pagarme).and_return(true)
    allow_any_instance_of(UserObserver).to receive(:after_create)
    allow_any_instance_of(Project).to receive(:download_video_thumbnail)
    allow_any_instance_of(Calendar).to receive(:fetch_events_from)
    allow_any_instance_of(Payment).to receive(:refund_queue_set).and_return(DirectRefundWorker.jobs)
    allow(Blog).to receive(:fetch_last_posts).and_return([])
    allow(Transfeera::BankAccountValidator).to receive(:validate).and_return({valid: true})

    # Default configurations
    CatarseSettings[:base_domain] = 'localhost'
    CatarseSettings[:host] = 'localhost'
    CatarseSettings[:email_contact] = 'foo@bar.com'
    CatarseSettings[:email_payments] = 'foo@bar.com'
    CatarseSettings[:email_projects] = 'foo@bar.com'
    CatarseSettings[:email_system] = 'system@catarse.me'
    CatarseSettings[:company_name] = 'Foo Bar Company'
    CatarseSettings[:timezone] = ActiveSupport::TimeZone.find_tzinfo(timezone).name
    CatarseSettings[:jwt_secret] = 'gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr9C'
    CatarseSettings[:pagarme_api_key] = ENV['TEST_GATEWAY_API_KEY']
    CatarseSettings[:pagarme_encryption_key] = ENV['TEST_GATEWAY_ENCRYPTION_KEY']
    CatarseSettings[:common_proxy_service_api] = 'http://localhost'
    CatarseSettings[:common_recommender_service_api] = 'http://localhost'
    CatarseSettings[:common_community_service_api] = 'http://localhost'
    CatarseSettings[:common_project_service_api]= 'http://localhost'
    CatarseSettings[:common_analytics_service_api] = 'http://localhost'
    CatarseSettings[:common_recommender_service_api] = 'http://localhost'
    CatarseSettings[:common_payment_service_api] = 'http://localhost'

    CatarsePagarme.configure do |config|
      config.api_key = CatarseSettings[:pagarme_api_key]
      config.ecr_key = CatarseSettings[:pagarme_encryption_key]
      config.slip_tax = 0
      config.credit_card_tax = 0
      config.interest_rate = 0
      config.host = 'localhost:3000'
    end

    # Email notification defaults
    UserNotifier.system_email     = CatarseSettings[:email_system]
    UserNotifier.from_email       = CatarseSettings[:email_contact]
    UserNotifier.from_name        = CatarseSettings[:company_name]

    allow_any_instance_of(Payment).to receive(:payment_engine).and_return(PaymentEngines::Interface.new)
    allow_any_instance_of(MixpanelObserver).to receive_messages(tracker: double('mixpanel tracker', track: nil, people: double('mixpanel people', { set: nil })))
  end
end

RSpec::Matchers.define :custom_permit do |action|
  match do |policy|
    policy.public_send(action.to_s)
  end

  failure_message do |policy|
    "#{policy.class} does not permit #{action} on #{policy.record} for #{policy.user.inspect}."
  end

  failure_message_when_negated do |policy|
    "#{policy.class} does not forbid #{action} on #{policy.record} for #{policy.user.inspect}."
  end
end
