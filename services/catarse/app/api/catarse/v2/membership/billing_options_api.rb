# frozen_string_literal: true

module Catarse
  module V2
    module Membership
      class BillingOptionsAPI < Grape::API
        helpers do
          def billing_option_params
            declared(params, include_missing: false)[:billing_option]
          end
        end

        params do
          requires :tier_id, type: String
        end

        get '/tiers/:tier_id/billing_options' do
          result = ::Membership::BillingOptions::List.result(tier_id: params[:tier_id])

          present :billing_options, result.billing_options, with: ::Membership::BillingOptionEntity
        end

        params do
          requires :tier_id, type: String
          requires :billing_option, type: Hash do
            requires :cadence_in_months, type: Integer
            requires :amount_cents, type: Integer
          end
        end

        post '/tiers/:tier_id/billing_options' do
          result = ::Membership::BillingOptions::Create.result(
            tier_id: params[:tier_id], attributes: billing_option_params
          )

          present :billing_option, result.billing_option, with: ::Membership::BillingOptionEntity
        end

        params do
          requires :id, type: String
          requires :billing_option, type: Hash do
            optional :cadence_in_months, type: Integer
            optional :amount_cents, type: Integer
            optional :enabled, type: Boolean
          end
        end
        put '/billing_options/:id' do
          result = ::Membership::BillingOptions::Update.result(id: params[:id], attributes: billing_option_params)

          present :billing_option, result.billing_option, with: ::Membership::BillingOptionEntity
        end

        params do
          requires :id, type: String
        end

        delete '/billing_options/:id' do
          ::Membership::BillingOptions::Destroy.result(id: params[:id])

          status :no_content
        end
      end
    end
  end
end
