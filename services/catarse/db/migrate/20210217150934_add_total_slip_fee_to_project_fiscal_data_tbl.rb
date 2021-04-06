class AddTotalSlipFeeToProjectFiscalDataTbl < ActiveRecord::Migration[6.1]
  def change
    add_column :project_fiscal_data_tbl, :total_slip_fee, :decimal, default: 0, precision: 8
  end
end
