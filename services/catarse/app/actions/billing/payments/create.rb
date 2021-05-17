# frozen_string_literal: true

module Billing
  module Payments
    class Create < Actor
      input :user, type: User
      input :attributes, type: Hash

      output :payment, type: Billing::Payment

      def call
        ActiveRecord::Base.transaction do
          self.payment = Billing::PaymentBuilder.new(attributes.merge(user_id: user.id)).build
          payment.save!
        end
      end
    end
  end
end
