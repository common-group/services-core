# frozen_string_literal: true

module Billing
  module Payments
    class ExpireOverduePayments < Actor
      def call
        Billing::Payment.overdue.find_each do |payment|
          payment.expire!
        rescue StandardError => e
          Sentry.capture_exception(e, level: :fatal, extra: { payment_id: payment.id })
        end
      end
    end
  end
end
