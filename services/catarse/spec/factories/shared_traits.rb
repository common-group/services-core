FactoryGirl.define do
  trait :with_fake_id do
    id { SecureRandom.uuid }
  end
end
