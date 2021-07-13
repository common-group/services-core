# frozen_string_literal: true

module Konduto
  module ParamsBuilders
    class Address
      attr_reader :address, :credit_card

      ATTRIBUTES = %i[name address1 address2 city state zip country].freeze

      def initialize(address, credit_card)
        @address = address
        @credit_card = credit_card
      end

      def build
        ATTRIBUTES.index_with { |attribute| send(attribute) }
      end

      def name
        credit_card.holder_name.to_s[0..99]
      end

      def address1
        address.line_1.to_s[0..254]
      end

      def address2
        address.line_2.to_s[0..254]
      end

      def city
        address.city.to_s[0..254]
      end

      def state
        address.state.to_s[0..99]
      end

      def zip
        address.postal_code.to_s[0..99]
      end

      def country
        address.country_code.to_s[0..1]
      end
    end
  end
end
