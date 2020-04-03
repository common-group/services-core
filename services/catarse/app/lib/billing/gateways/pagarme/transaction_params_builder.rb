module Billing
  module Gateways
    module Pagarme
      class TransactionParamsBuilder
        attr_reader :payment_request

        def initialize(payment_request)
          @payment_request = payment_request
        end

        def build
          if payment_request.credit_card?
            build_params_for_credit_card_transaction
          elsif payment_request.bank_slip?
            build_params_for_bank_slip_transaction
          else
            raise 'Unknown payment method'
          end
        end

        private

        def shared_params
          {
            reference_key: payment_request.id,
            amount: (payment_request.total_amount * 100).to_i,
            async: false,
            installments: payment_request.installments_count,
            postback_url: postback_url
          }
        end

        def build_params_for_credit_card_transaction
          card_identifier = if payment_request.gateway_card_id.present?
            { card_id: payment_request.gateway_card_id }
          else
            { card_hash: payment_request.gateway_card_hash }
          end

          shared_params.merge(card_identifier).merge(
            payment_method: 'credit_card',
            capture: false,
            soft_descriptor: 'Catarse'
          )
        end

        def build_params_for_bank_slip_transaction
          shared_params.merge(
            payment_method: 'boleto',
            boleto_expiration_date: 2.business_days.from_now.to_date,
            customer: {
              name: payment_request.user.name,
              document: payment_request.user.cpf
            }
          )
        end

        def postback_url
          subdomain = Rails.env.production? ? 'www' : 'sandbox'
          host = CatarseSettings.get_without_cache(:host)
          path = 'v2/integrations/webhooks/pagarme'
          "https://#{subdomain}.#{host}/#{path}"
        end
      end
    end
  end
end
