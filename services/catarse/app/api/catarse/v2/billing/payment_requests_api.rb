module Catarse
  module V2
    module Billing
      class PaymentRequestsAPI < Grape::API
        helpers do
          def payment_request_params
            declared(params, include_missing: false)[:payment_request].deep_symbolize_keys
          end
        end

        desc 'Create and charge a new payment request'
        params do
          requires :payment_request, type: Hash do
            requires :payment_method, type: String, values: %w[bank_slip credit_card]
            requires :installments_count, type: Integer, values: 1..6
            optional :gateway_card_hash, type: String
            optional :gateway_card_id, type: String

            given payment_method: ->(val) { val == 'credit_card' } do
              exactly_one_of :gateway_card_hash, :gateway_card_id
            end

            requires :billing_address, type: Hash do
              requires :country_id, type: Integer
              requires :zip_code, type: String
              requires :line_1, type: String
              optional :line_2, type: String
              optional :number, type: String
              optional :neighborhood, type: String
              requires :city, type: String
              optional :state, type: String
              optional :state_id, type: String
              optional :phone_number, type:String

              exactly_one_of :state, :state_id
            end

            requires :items, type: Array[JSON] do
              requires :payable_id, type: Integer
              requires :payable_type, type: String, values: %w[Contribution Subscription]
            end
          end
        end

        post '/payment_requests' do
          result = ::Billing::ProcessCheckout.call(user: User.last, payment_request_attributes: payment_request_params)

          if result.success?
            present :payment_request, result.payment_request, with: ::Billing::PaymentRequestEntity
          else
            present :error, result.message
            present :payment_request, result.payment_request, with: ::Billing::PaymentRequestEntity
            status :unprocessable_entity
          end
        end
      end
    end
  end
end
