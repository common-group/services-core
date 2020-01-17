class CreateBillingPaymentRequestItems < ActiveRecord::Migration
  def change
    create_table :payment_request_items, id: :uuid do |t|
      t.references :payment_request, null: false, index: true, foreign_key: true, type: :uuid
      t.references :payable, null: false, index: true, polymorphic: true, index: true
      t.decimal :amount, null: false, precision: 10, scale: 2

      t.timestamps null: false
    end
  end
end
