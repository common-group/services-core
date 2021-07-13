# frozen_string_literal: true

module Billing
  class Gateways < EnumerateIt::Base
    associate_values(:pagar_me)
  end
end
