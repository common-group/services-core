# frozen_string_literal: true

module Billing
  class ProcessingFeeVendors < EnumerateIt::Base
    associate_values(:pagar_me, :konduto)
  end
end
