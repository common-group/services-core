# frozen_string_literal: true

module Billing
  module Payments
    class AnalyzeTransaction < Actor
      include Helpers::ErrorHandler

      input :payment, type: Billing::Payment
      input :konduto_client, type: Konduto::Client, default: -> { Konduto::Client.new }

      MAPPED_ACTION = {
        'APPROVE' => :approve_on_antifraud!,
        'DECLINE' => :decline_on_antifraud!,
        'REVIEW' => :wait_review!,
        'NONE' => nil
      }.freeze

      def call
        return if can_skip_analysis?

        response = konduto_client.create_order(build_order_params)
        action = evaluate_next_action(response)

        return if action.nil?

        create_processing_fee!
        payment.send(action, response)
      end

      private

      def can_skip_analysis?
        payment.in_state?(:authorized) && credit_card_in_safelist?
      end

      def credit_card_in_safelist?
        Billing::CreditCard.safelist.exists?(gateway_id: payment.credit_card.gateway_id)
      end

      def build_order_params
        Konduto::ParamsBuilders::Order.new(payment: payment).build
      end

      def evaluate_next_action(response)
        recommendation = response.dig('order', 'recommendation')

        unless MAPPED_ACTION.key?(recommendation)
          handle_fatal_error('Invalid antifraud request',
            { data: response, payment_id: payment.id, user_id: payment.user_id }
          )
        end

        MAPPED_ACTION[recommendation]
      end

      def create_processing_fee!
        # TODO: Get antifraud analysis cost from settings
        antifraud_analysis_cost = (CatarseSettings.get_without_cache(:antifraud_tax).to_f * 100).to_i
        payment.processing_fees.create!(
          vendor: Billing::ProcessingFeeVendors::KONDUTO,
          amount_cents: antifraud_analysis_cost
        )
      end
    end
  end
end
