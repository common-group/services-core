module Billing
  class PaymentRequestItem < ActiveRecord::Base
    belongs_to :payable, polymorphic: true
  end
end
