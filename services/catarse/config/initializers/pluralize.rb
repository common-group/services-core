# frozen_string_literal: true

module ActionView
  module Helpers
    module TextHelper
      def pluralize_without_number(count, singular, plural = nil)
        count == 1 || count =~ /^1(\.0+)?$/ ? singular : (plural || singular.pluralize)
      end
    end
  end
end
