# frozen_string_literal: true

module Billing
  module GatewayPayables
    class Import < Actor
      input :payment, type: Billing::Payment
      input :pagar_me_client, type: PagarMe::Client, default: -> { PagarMe::Client.new }

      def call
        payables_data = pagar_me_client.list_transaction_payables(payment.gateway_id)

        if payables_data.size != payment.installments_count
          fail!(error: 'Payables count doesn`t match payment installments count')
        end

        import_gateway_payables(payables_data)
      end

      def import_gateway_payables(payables_data)
        gateway_payables = payables_data.map { |data| build_gateway_payable(data) }

        ActiveRecord::Base.transaction { gateway_payables.each(&:save!) }
      end

      def build_gateway_payable(payable_data)
        gateway_payable = payment.gateway_payables.find_or_initialize_by(gateway_id: payable_data['id'])
        gateway_payable.assign_attributes(
          state: payable_data['status'],
          amount_cents: payable_data['amount'],
          fee_cents: payable_data['fee'],
          installment_number: payable_data['installment'],
          paid_at: payable_data['payment_date'].try(:to_datetime),
          data: payable_data
        )
        gateway_payable
      end
    end
  end
end
