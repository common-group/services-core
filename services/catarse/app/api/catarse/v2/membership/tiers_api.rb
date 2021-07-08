# frozen_string_literal: true

module Catarse
  module V2
    module Membership
      class TiersAPI < Grape::API
        helpers do
          def tier_params
            declared(params, include_missing: false)[:tier]
          end
        end

        params do
          requires :project_id, type: String
        end

        get '/tiers' do
          result = ::Membership::Tiers::List.result(project_id: params[:project_id])

          present :tiers, result.tiers, with: ::Membership::TierEntity
        end

        params do
          requires :tier, type: Hash do
            requires :project_id, type: String
            requires :name, type: String
            requires :description, type: String
            optional :subscribers_limit, type: Integer
            optional :request_shipping_address, type: Boolean
          end
        end

        post '/tiers' do
          result = ::Membership::Tiers::Create.result(attributes: tier_params)

          present :tier, result.tier, with: ::Membership::TierEntity
        end
      end
    end
  end
end
