# frozen_string_literal: true

FactoryBot.define do
  factory :common_address, class: 'Common::Address' do
    association :user
    country_code { Faker::Address.country_code }
    postal_code { Faker::Address.zip_code }
    line_1 { Faker::Address.street_address }
    line_2 { Faker::Address.secondary_address }
    number { Faker::Address.building_number }
    neighborhood { Faker::Address.community }
    city { Faker::Address.city }
    state { Faker::Address.state }
    phone_number { Faker::PhoneNumber.cell_phone }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    organization { Faker::Company.name }
  end
end
