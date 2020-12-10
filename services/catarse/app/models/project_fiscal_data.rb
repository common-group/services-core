# frozen_string_literal: true

class ProjectFiscalData < ApplicationRecord
  self.table_name = 'public.project_fiscal_data_tbl'

  belongs_to :project
  belongs_to :user

  def find(id)
    self
  end
end
