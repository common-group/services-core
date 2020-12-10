class AddTotalTaxIntoProjects < ActiveRecord::Migration[4.2]
  def up
    add_column :projects, :service_fee, :numeric, default: 0.13
  end

  def down
    remove_column :projects, :service_fee
  end
end
