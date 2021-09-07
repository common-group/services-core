class CreateBillingPixes < ActiveRecord::Migration[6.1]
  def change
    create_table :billing_pixes do |t|
      t.references :payment, null: false, foreign_key: { on_delete: :cascade, to_table: :billing_payments }
      t.string :key, null: false
      t.datetime :expires_at, null: false

      t.timestamps
    end
  end
end
