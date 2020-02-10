module Billing
  class PaymentRequestEntity < Grape::Entity
    expose :id
    expose :state
    expose :total_amount
    expose :payment_method
    expose :installments_count
    expose :billing_address
    expose :items
  end
end
