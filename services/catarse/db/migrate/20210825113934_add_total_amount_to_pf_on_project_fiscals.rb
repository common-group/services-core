class AddTotalAmountToPfOnProjectFiscals < ActiveRecord::Migration[6.1]
  def change
    add_monetize :project_fiscals, :total_amount_to_pf
  end
end
