# frozen_string_literal: true

module Billing
  module Payments
    class AnalyzeTransaction < Actor
      include Helpers::ErrorHandler

      input :payment, type: Billing::Payment
      input :konduto_client, type: Konduto::Client, default: -> { Konduto::Client.new }

      MAPPED_RECOMMENDATIONS = {
        'APPROVE' => :approved_on_antifraud,
        'DECLINE' => :declined_on_antifraud,
        'REVIEW' => :waiting_review,
        'NONE' => nil
      }.freeze

      def call
        return if can_skip_analysis?

        response = konduto_client.create_order(build_order_params)
        next_state = evaluate_next_state(response)
        payment.transition_to!(next_state, response) if next_state
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

      def evaluate_next_state(response)
        recommendation = response.dig('order', 'recommendation')

        unless MAPPED_RECOMMENDATIONS.key?(recommendation)
          handle_fatal_error('Invalid antifraud request',
            { data: response, payment_id: payment.id, user_id: payment.user_id }
          )
        end

        MAPPED_RECOMMENDATIONS[recommendation]
      end
    end
  end
end
