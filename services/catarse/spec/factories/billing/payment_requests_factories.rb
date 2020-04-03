FactoryGirl.define do
  factory :payment_request, class: 'Billing::PaymentRequest' do
    user { create(:user, :without_bank_data) }
    association :billing_address, factory: :address
    state { Billing::PaymentRequest.aasm.states.map(&:name).sample }
    gateway_fee { 0 }
    gateway_id { SecureRandom.uuid }

    trait :bank_slip do
      payment_method { :bank_slip }
      installments_count { 1 }
      gateway_card_hash { nil }
      gateway_card_id { nil }
    end

    trait :credit_card do
      payment_method { :credit_card }
      installments_count { (1..6).to_a.sample }
      gateway_card_hash { Faker::Lorem.word }
      gateway_card_id { Faker::Lorem.word }
    end

    transient do
      payables do
        create_list(
          :contribution,
          1,
          user: User.last,
          project: create(:project, user: create(:user, :without_bank_data))
        )
      end
    end

    after :build do |payment_request, evaluator|
      payment_request.total_amount = evaluator.payables.to_a.sum(&:value)
    end

    after :create do |payment_request, evaluator|
      evaluator.payables.each do |payable|
        payment_request.items.create!(payable: payable, amount: payable.value)
      end
    end
  end
end
