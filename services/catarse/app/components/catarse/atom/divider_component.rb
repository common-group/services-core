# frozen_string_literal: true

module Catarse
  module Atom
    class DividerComponent < ViewComponent::Base
      attr_reader :orientation

      def initialize(orientation:)
        @orientation = orientation
      end
    end
  end
end
