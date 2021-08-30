class RemoveTotalAmountOnProjectFiscals < ActiveRecord::Migration[6.1]
  def remove
    remove_monetize :project_fiscals, :total_amount
  end
end
