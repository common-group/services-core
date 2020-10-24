# frozen_string_literal: true

class CategoryTotal < ApplicationRecord
  include Shared::MaterializedView
  self.table_name = '"1".category_totals'
end
