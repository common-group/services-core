class CreateBillingProcessingFees < ActiveRecord::Migration[6.1]
  def change
    create_table :billing_processing_fees do |t|
      t.references :payment, null: false, foreign_key: { on_delete: :cascade, to_table: :billing_payments }
      t.monetize :amount
      t.string :vendor, null: false

      t.timestamps
    end
  end
end
