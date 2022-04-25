# frozen_string_literal: true

module Catarse
  module Molecule
    module RewardCard
      class DeliveryStatusComponent < ViewComponent::Base
        attr_reader :estimated_delivery_time, :delivery_type

        def initialize(estimated_delivery_time:, delivery_type:)
          @estimated_delivery_time = estimated_delivery_time
          @delivery_type = delivery_type
        end

        def divider_horizontal
          Catarse::Atom::DividerComponent.new(orientation: 'horizontal');
        end
      end
    end
  end
end
