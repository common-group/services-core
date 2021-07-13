# frozen_string_literal: true

module Konduto
  module ParamsBuilders
    class Payment
      attr_reader :payment, :credit_card

      ATTRIBUTES = %i[type status bin last4 amount expiration_date].freeze

      def initialize(payment)
        @payment = payment
        @credit_card = payment.credit_card
      end

      def build
        ATTRIBUTES.index_with { |attribute| send(attribute) }
      end

      def type
        'credit'
      end

      def status
        payment.in_state?(:authorized) ? 'approved' : 'declined'
      end

      def bin
        credit_card.bin
      end

      def last4
        credit_card.last_digits
      end

      def amount
        payment.total_amount.to_f
      end

      def expiration_date
        credit_card.expires_on.strftime('%m%Y')
      end
    end
  end
end
