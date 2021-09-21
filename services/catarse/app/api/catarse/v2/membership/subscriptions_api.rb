# frozen_string_literal: true

module Catarse
  module V2
    module Membership
      class SubscriptionsAPI < Grape::API
        helpers do
          def subscription_params
            declared(params, include_missing: false)[:subscription]
          end
        end

        params do
          requires :subscription, type: Hash do
            requires :billing_option_id, type: Integer
            requires :amount_cents, type: Integer
          end
        end

        post '/subscriptions' do
          result = ::Membership::Subscriptions::Create.result(user: current_user, attributes: subscription_params)

          present :subscription, result.subscription, with: ::Membership::SubscriptionEntity
        end
      end
    end
  end
end
