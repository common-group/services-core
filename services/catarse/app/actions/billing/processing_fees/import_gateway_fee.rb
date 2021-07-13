# frozen_string_literal: true

module Billing
  module ProcessingFees
    class ImportGatewayFee < Actor
      input :payment, type: Billing::Payment
      input :pagar_me_client, type: PagarMe::Client, default: -> { PagarMe::Client.new }

      def call
        import_gateway_payables!

        transaction_data = pagar_me_client.find_transaction(payment.gateway_id)
        processing_fee_amount_cents = calculate_processing_fee_amount(transaction_data['cost'])

        payment.processing_fees.create!(
          vendor: Billing::ProcessingFeeVendors::PAGAR_ME,
          amount_cents: processing_fee_amount_cents
        )
      end

      private

      def import_gateway_payables!
        result = Billing::GatewayPayables::Import.result(payment: payment)

        fail!(error: 'Gateway payables cannot be imported') if result.failure?
      end

      def calculate_processing_fee_amount(transaction_cost_cents)
        payables_fee_cents = payment.gateway_payables.sum(:fee_cents)

        if payment.credit_card?
          transaction_cost_cents + payables_fee_cents
        elsif payment.boleto? || payment.pix?
          payables_fee_cents.zero? ? transaction_cost_cents : payables_fee_cents
        end
      end
    end
  end
end
