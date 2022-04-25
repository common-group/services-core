# frozen_string_literal: true

module Catarse
  module Atom
    class ButtonComponent < ViewComponent::Base
      attr_reader :label, :type

      def initialize(label:, type:)
        @label = label
        @type = type
      end
    end
  end
end
