# frozen_string_literal: true

module Catarse
  module Molecule
    module RewardCard
      class HeaderComponent < ViewComponent::Base
        attr_reader :price, :title, :type, :has_image

        def initialize(title:, price:, type:, has_image:)
          @title = title
          @price = price
          @type = type
          @has_image = has_image
        end

        def with_divider?
          !has_image
        end

        def divider_horizontal
          Catarse::Atom::DividerComponent.new(orientation: 'horizontal')
        end
      end
    end
  end
end
