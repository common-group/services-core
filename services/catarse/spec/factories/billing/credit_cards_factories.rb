FactoryGirl.define do
  factory :new_credit_card, class: 'Billing::CreditCard' do
    owner { create(:payment_request, :credit_card) }
    gateway { Faker::Lorem.word }
    gateway_id { Faker::Crypto.md5 }
    holder_name { Faker::Name.name }
    first_digits { Faker::Stripe.valid_card[0..5] }
    last_digits { Faker::Stripe.valid_card[-4..-1] }
    country_code { Faker::Address.country_code }
    brand { Faker::Company.name }
    expires_on { Faker::Date.forward(1825) }
  end
end
