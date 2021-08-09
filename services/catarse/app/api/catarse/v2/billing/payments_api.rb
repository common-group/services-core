# frozen_string_literal: true

module Catarse
  module V2
    module Billing
      class PaymentsAPI < Grape::API
        params do
          requires :payment, type: Hash do
            requires :payment_method, type: String
            requires :installments_count, type: Integer

            requires :billing_address_id, type: String
            optional :shipping_address_id, type: String

            requires :payables, type: Array[JSON] do
              requires :id, type: String
              requires :type, type: String, values: ::Billing::PaymentItem::ALLOWED_PAYABLE_TYPES
            end

            optional :credit_card_id, type: String
            optional :credit_card_hash, type: String

            given payment_method: ->(val) { val == ::Billing::PaymentMethods::CREDIT_CARD } do
              exactly_one_of :credit_card_id, :credit_card_hash
            end
          end
        end

        post '/payments' do
          payment_params = declared(params, include_missing: false)[:payment]

          result = ::Billing::Payments::Checkout.result(user: current_user, attributes: payment_params)

          result.payment
        end
      end
    end
  end
end
