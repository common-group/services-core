# frozen_string_literal: true

module Catarse
  module Atom
    module RewardCard
      class ImageComponent < ViewComponent::Base
        attr_reader :image

        def initialize(image:)
          @image = image
        end
      end
    end
  end
end
