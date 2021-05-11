# frozen_string_literal: true

module Billing
  class PaymentMethods < EnumerateIt::Base
    associate_values(:credit_card, :pix, :boleto)
  end
end
