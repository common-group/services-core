
FactoryGirl.define do
  factory :payment_request_item, class: 'Billing::PaymentRequestItem' do
    payment_request { create(:payment_request, [:bank_slip, :credit_card].sample) }

    after :build do |item|
      item.payable = create(
        :contribution,
        user: item.payment_request.user,
        project: create(:project, user: create(:user, :without_bank_data))
      )
      item.amount = item.payable.value
    end
  end
end
