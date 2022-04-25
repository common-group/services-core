module Catarse
  module Molecule
    module Card
      class HeaderComponent < ViewComponent::Base
        attr_reader :content

        def initialize(content:)
          @content = content
        end
      end
    end
  end
end