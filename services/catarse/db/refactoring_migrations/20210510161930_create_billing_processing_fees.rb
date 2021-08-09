class CreateBillingProcessingFees < ActiveRecord::Migration[6.1]
  def change
    create_table :billing_processing_fees, id: :uuid do |t|
      t.references :payment, null: false, foreign_key: { to_table: :billing_payments }, type: :uuid
      t.monetize :amount
      t.string :vendor, null: false

      t.timestamps
    end
  end
end
