# frozen_string_literal: true

class ProjectFinancial < ApplicationRecord
  acts_as_copy_target

  self.implicit_order_column = nil
end
