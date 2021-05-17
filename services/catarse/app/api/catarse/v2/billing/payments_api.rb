# frozen_string_literal: true

module Catarse
  module V2
    module Billing
      class PaymentsAPI < Grape::API
        params do
          requires :payment, type: Hash do
            requires :payment_method, type: String
            requires :gateway, type: String
            requires :installments_count, type: Integer

            requires :billing_address_id, type: String
            optional :shipping_address_id, type: String

            requires :payables, type: Array[JSON] do
              requires :id, type: Integer
              requires :type, type: String, values: %w[Contribution Subscription]
            end

            optional :credit_card_id, type: String
            optional :credit_card_hash, type: String

            given payment_method: ->(val) { val == ::Billing::PaymentMethods::CREDIT_CARD } do
              exactly_one_of :credit_card_id, :credit_card_hash
            end
          end
        end

        post '/payments' do
          # TODO: Payment in installments
          payment_params = declared(params, include_missing: false)[:payment]

          result = ::Billing::Payments::Checkout.result(user: User.last, attributes: payment_params)

          result.payment
        end
      end
    end
  end
end
