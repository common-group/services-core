# frozen_string_literal: true

module Catarse
  module V2
    module Billing
      class PaymentsAPI < Grape::API
        params do
          requires :payment, type: Hash do
            requires :payment_method, type: String
            requires :gateway, type: String

            requires :billing_address_id, type: String
            optional :shipping_address_id, type: String

            requires :payables, type: Array[JSON] do
              requires :id, type: Integer
              requires :type, type: String, values: %w[Contribution Subscription]
            end
          end
        end

        post '/payments' do
          # TODO: Receive credit cards identifiers (id or hash)
          # TODO: Payment in installments
          payment_params = declared(params, include_missing: false)[:payment]

          result = ::Billing::Payments::Checkout.result(user: User.last, attributes: payment_params)

          result.payment
        end
      end
    end
  end
end
