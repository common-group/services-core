class AddSlipFeeToPayments < ActiveRecord::Migration[6.1]
  def change
    add_column :payments, :slip_fee, :decimal, default: 0, precision: 8
  end
end
