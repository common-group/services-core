# frozen_string_literal: true

module Catarse
  module V2
    module Billing
      class PaymentsAPI < Grape::API
        helpers do
          def payment_params
            declared(params, include_missing: false)[:payment]
          end
        end

        params do
          requires :payment, type: Hash do
            requires :payment_method, type: String
            requires :installments_count, type: Integer

            optional :shipping_address_id, type: Integer

            requires :payables, type: Array[JSON] do
              requires :id, type: Integer
              requires :type, type: String, values: ::Billing::PaymentItem::ALLOWED_PAYABLE_TYPES
            end

            given payment_method: ->(val) { val == ::Billing::PaymentMethods::CREDIT_CARD } do
              requires :credit_card_id, type: Integer
            end
          end
        end

        post '/payments' do
          result = ::Billing::Payments::Process.result(user: current_user, attributes: payment_params)

          result.payment
        end
      end
    end
  end
end
