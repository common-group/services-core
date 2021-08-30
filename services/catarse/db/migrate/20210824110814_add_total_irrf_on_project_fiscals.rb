class AddTotalIrrfOnProjectFiscals < ActiveRecord::Migration[6.1]
  def change
    add_monetize :project_fiscals, :total_irrf
  end
end
