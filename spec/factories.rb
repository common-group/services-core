FactoryBot.define do

  sequence :permalink do |n|
    "foo_page_#{n}"
  end

  sequence :domain do |n|
    "foo#{n}lorem.com"
  end

  factory :platform_api_key, class: CommonModels::PlatformApiKey do |f|
    platform
    f.token { "platform_api_key_#{SecureRandom.hex(50)}" }
  end

  factory :user_api_key, class: CommonModels::UserApiKey do |f|
    platform
    user
    f.token { "user_api_key_#{SecureRandom.hex(50)}" }
  end

  factory :temp_login_api_key, class: CommonModels::TempLoginApiKey do |f|
    platform
    user
    f.token { "temp_login_api_key_#{SecureRandom.hex(50)}" }
    expires_at { 2.hours.from_now }
  end

  factory :origin, class: CommonModels::Origin do |f|
    platform
    f.referral { generate(:permalink) }
    f.domain { generate(:domain) }
  end

  factory :platform, class: CommonModels::Platform do
    name 'Platform name'
    token { SecureRandom.uuid }
  end

  factory :goal, class: CommonModels::Goal do
    project
    title "Foo goal"
    description "Description goal"
    value 100
  end

  factory :report, class: CommonModels::Report do
    project
    reason "Foo report"
    email "Email report "
    details "Details report"
  end

  factory :project, class: CommonModels::Project do
    goal 100
    headline 'Foo headline'
    about_html 'foo html description'
    state 'draft'
    mode 'sub'
    name 'Foo project name'
    service_fee 0.13
    sequence(:permalink) do |n|
      "permalink_#{n}"
    end
    user
    platform
  end

  factory :user, class: CommonModels::User do
    platform
    name 'foo user'
    sequence(:email) do |n|
      "email#{n}@email.com"
    end
    account_type 'pf'
    password_hash '123456'
  end

  factory :catalog_payment, class: CommonModels::CatalogPayment do
    platform
    project
    user
    data '{value: 10.00}'
    gateway 'Pagarme'
  end

  factory :contribution, class: CommonModels::Contribution do
    project
    user
    platform
    value 10.00
    payer_name 'Foo Bar'
    payer_email 'foo@bar.com'
    anonymous false
    factory :deleted_contribution do
      after :create do |contribution|
        create(:catalog_payment, status: 'deleted', data: {value: contribution.value}, contribution: contribution, created_at: contribution.created_at)
      end
    end
    factory :refused_contribution do
      after :create do |contribution|
        create(:catalog_payment, status: 'refused', data: {value: contribution.value}, contribution: contribution, created_at: contribution.created_at)
      end
    end
    factory :confirmed_contribution do
      after :create do |contribution|
        create(:catalog_payment, status: 'paid', data: {value: contribution.value, payment_method: 'boleto'}, contribution: contribution, created_at: contribution.created_at)
      end
    end
    factory :pending_contribution do
      after :create do |contribution|
        create(:catalog_payment, status: 'pending', data: {value: contribution.value}, contribution: contribution, created_at: contribution.created_at)
      end
    end
    factory :pending_refund_contribution do
      after :create do |contribution|
        create(:catalog_payment, status: 'pending_refund', data: {value: contribution.value}, contribution: contribution, created_at: contribution.created_at)
      end
    end
    factory :refunded_contribution do
      after :create do |contribution|
        create(:catalog_payment, status: 'refunded', data: {value: contribution.value}, contribution: contribution, created_at: contribution.created_at)
      end
    end
    factory :contribution_with_credits do
      after :create do |contribution|
        create(:catalog_payment, status: 'paid', gateway: 'Credits', data: {value: contribution.value}, contribution: contribution, created_at: contribution.created_at)
      end
    end
  end
end
