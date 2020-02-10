class CreatePaymentRequestItems < ActiveRecord::Migration
  def change
    create_table :payment_request_items, id: :uuid do |t|
      t.references :payment_request, null: false, index: true, foreign_key: true, type: :uuid
      t.references :payable, null: false, index: true, polymorphic: true
      t.decimal :amount, null: false, precision: 10, scale: 2

      t.timestamps null: false
    end

    add_index :payment_request_items,
      %i[payment_request_id payable_type payable_id],
      unique: true,
      name: 'index_pri_on_pr_id_and_payable_type_and_payable_id'
  end
end
