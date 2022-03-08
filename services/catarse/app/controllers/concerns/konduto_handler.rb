# frozen_string_literal: true

module KondutoHandler
  extend ActiveSupport::Concern

  included do
    helper_method :render_konduto_script

    def render_konduto_script
      render_to_string(partial: 'catarse_bootstrap/layouts/konduto').html_safe
    end
  end
end
