# frozen_string_literal: true

module Konduto
  module ParamsBuilders
    class Order
      attr_reader :user, :credit_card, :billing_address, :shipping_address, :payment_items

      ATTRIBUTES = %i[
        id
        visitor
        total_amount
        shipping_amount
        currency
        installments
        ip
        purchased_at
        analyze
        customer
        payment
        billing
        shipping
        shopping_cart
      ].freeze

      def initialize(payment:)
        @payment = payment
        @user = @payment.user
        @credit_card = @payment.credit_card
        @billing_address = @payment.billing_address
        @shipping_address = @payment.shipping_address
        @payment_items = @payment.items
      end

      def build
        ATTRIBUTES.index_with { |attribute| send(attribute) }
      end

      def id
        @payment.id.to_s
      end

      def visitor
        user.id.to_s
      end

      def total_amount
        @payment.total_amount.to_f
      end

      def shipping_amount
        @payment.shipping_fee.to_f
      end

      def currency
        @payment.total_amount_currency
      end

      def installments
        @payment.installments_count
      end

      def ip
        user.current_sign_in_ip
      end

      def purchased_at
        @payment.created_at.iso8601
      end

      def analyze
        @payment.in_state?(:authorized)
      end

      def customer
        Konduto::ParamsBuilders::Customer.new(user).build
      end

      def payment
        [Konduto::ParamsBuilders::Payment.new(@payment).build]
      end

      def billing
        Konduto::ParamsBuilders::Address.new(billing_address, credit_card).build
      end

      def shipping
        Konduto::ParamsBuilders::Address.new(shipping_address, credit_card).build if shipping_address.present?
      end

      def shopping_cart
        payment_items.map { |item| Konduto::ParamsBuilders::ShoppingCartItem.new(item).build }
      end
    end
  end
end
