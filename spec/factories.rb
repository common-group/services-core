FactoryBot.define do
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
    password '123456'
  end
end
