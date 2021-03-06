# frozen_string_literal: true

# Fix issue with render_to_string in Rails 4.1.1
# Done according to https://github.com/rails/rails/issues/14125
module AbstractController
  module Rendering
    # Normalize args and options.
    # :api: private
    def _normalize_render(*args, &block)
      options = _normalize_args(*args, &block)
      # TODO: remove defined? when we restore AP <=> AV dependency
      options[:variant] = request.variant if defined?(request) && request && request.variant.present?

      _normalize_options(options)
      options
    end
  end
end
