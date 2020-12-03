# frozen_string_literal: true

class ProjectFiscalInform < ApplicationRecord
  self.table_name = 'public.project_fiscal_informs_view'
  belongs_to :project
  belongs_to :user

  def find(id)
    self
  end
end
