# frozen_string_literal: true

class Statistics < ApplicationRecord
  self.table_name = '"1".statistics'

  default_scope { order('total_users DESC') }
  include Shared::MaterializedView
end
