# frozen_string_literal: true

module Konduto
  module ParamsBuilders
    class ShoppingCartItem
      attr_reader :payment_item, :reward, :project, :object

      ATTRIBUTES = %i[sku product_code created_at category name description unit_cost quantity].freeze

      def initialize(payment_item)
        @payment_item = payment_item
        @reward = payment_item.payable.reward
        @project = payment_item.payable.project
        @object = reward || project
      end

      def build
        ATTRIBUTES.index_with { |attribute| send(attribute) }
      end

      def sku
        object.id.to_s
      end

      def product_code
        object.id.to_s
      end

      def created_at
        object.created_at.to_date.iso8601
      end

      def category
        9999
      end

      def name
        project.name.to_s[0..99]
      end

      def description
        reward.try(:description).to_s[0..99]
      end

      def unit_cost
        payment_item.amount.to_f
      end

      def quantity
        1
      end
    end
  end
end
