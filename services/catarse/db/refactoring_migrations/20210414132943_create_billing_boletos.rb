class CreateBillingBoletos < ActiveRecord::Migration[6.1]
  def change
    create_table :billing_boletos do |t|
      t.references :payment, null: false, foreign_key: { on_delete: :cascade, to_table: :billing_payments }
      t.string :barcode, null: false
      t.string :url, null: false
      t.datetime :expires_at, null: false

      t.timestamps
    end
  end
end
