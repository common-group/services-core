class CreateBillingGatewayPayables < ActiveRecord::Migration[6.1]
  def change
    create_table :billing_gateway_payables, id: :uuid do |t|
      t.references :payment, null: false, foreign_key: { to_table: :billing_payments }, type: :uuid
      t.string :gateway_id, null: false
      t.string :state, null: false
      t.monetize :amount
      t.monetize :fee
      t.integer :installment_number, null: false
      t.datetime :paid_at
      t.jsonb :data, default: {}

      t.timestamps
    end

    add_index :billing_gateway_payables, %i[payment_id gateway_id], unique: true
  end
end
