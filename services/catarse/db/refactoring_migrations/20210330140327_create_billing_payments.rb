class CreateBillingPayments < ActiveRecord::Migration[6.1]
  def change
    create_table :billing_payments do |t|
      t.references :user, null: false, foreign_key: { on_delete: :restrict }

      t.monetize :total_amount
      t.string :payment_method, null: false
      t.string :state, null: false
      t.string :gateway, null: false
      t.string :gateway_id

      t.timestamps
    end
  end
end
