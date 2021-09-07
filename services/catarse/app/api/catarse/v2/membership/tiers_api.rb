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
          requires :project_id, type: Integer
        end

        get '/projects/:project_id/tiers' do
          result = ::Membership::Tiers::List.result(project_id: params[:project_id])

          present :tiers, result.tiers, with: ::Membership::TierEntity
        end

        params do
          requires :project_id, type: Integer
          requires :tier, type: Hash do
            requires :name, type: String
            requires :description, type: String
            optional :subscribers_limit, type: Integer
            optional :request_shipping_address, type: Boolean
          end
        end

        post '/projects/:project_id/tiers' do
          result = ::Membership::Tiers::Create.result(project_id: params[:project_id], attributes: tier_params)

          present :tier, result.tier, with: ::Membership::TierEntity
        end

        params do
          requires :id, type: Integer
          requires :tier, type: Hash do
            optional :project_id, type: String
            optional :name, type: String
            optional :description, type: String
            optional :subscribers_limit, type: Integer
            optional :request_shipping_address, type: Boolean
          end
        end

        put '/tiers/:id' do
          result = ::Membership::Tiers::Update.result(id: params[:id], attributes: tier_params)

          present :tier, result.tier, with: ::Membership::TierEntity
        end

        params do
          requires :id, type: Integer
        end

        delete '/tiers/:id' do
          ::Membership::Tiers::Destroy.result(id: params[:id])

          status :no_content
        end
      end
    end
  end
end
