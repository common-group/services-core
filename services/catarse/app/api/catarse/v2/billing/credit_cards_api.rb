# frozen_string_literal: true

module Catarse
  module V2
    module Billing
      class CreditCardsAPI < Grape::API
        helpers do
          def credit_card_params
            declared(params, include_missing: false)[:credit_card]
          end
        end

        params do
          requires :credit_card, type: Hash do
            requires :hash, type: String
            requires :billing_address_id, type: Integer
            optional :saved, type: Boolean
          end
        end

        post '/credit_cards' do
          result = ::Billing::CreditCards::CreateOrUpdate.result(user: current_user, attributes: credit_card_params)

          present :credit_card, result.credit_card, with: ::Billing::CreditCardEntity
        end
      end
    end
  end
end
