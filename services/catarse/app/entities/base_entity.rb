# frozen_string_literal: true

class BaseEntity < Grape::Entity
  format_with(:iso_timestamp) { |datetime| datetime.try(:iso8601) }
end
