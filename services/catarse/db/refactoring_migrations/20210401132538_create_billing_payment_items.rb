class CreateBillingPaymentItems < ActiveRecord::Migration[6.1]
  def change
    create_table :billing_payment_items, id: :uuid do |t|
      t.references :payment, null: false, foreign_key: { to_table: :billing_payments }, type: :uuid
      t.references :payable, polymorphic: true, null: false, type: :string
      t.monetize :amount
      t.monetize :shipping_fee
      t.monetize :total_amount
      t.string :state, null: false

      t.timestamps
    end
  end
end
