class CreateBillingPaymentItems < ActiveRecord::Migration[6.1]
  def change
    create_table :billing_payment_items do |t|
      t.references :payment, null: false, foreign_key: { on_delete: :cascade, to_table: :billing_payments }

      t.references :payable, polymorphic: true, null: false
      t.monetize :amount
      t.monetize :shipping_fee
      t.monetize :total_amount
      t.string :state, null: false

      t.timestamps
    end
  end
end
