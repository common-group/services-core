# frozen_string_literal: true

class UserTotal < ApplicationRecord
  include Shared::MaterializedView
  self.primary_key = :id
  self.table_name = '"1".user_totals'
end
