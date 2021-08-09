class CreateBillingPixes < ActiveRecord::Migration[6.1]
  def change
    create_table :billing_pixes, id: :uuid do |t|
      t.references :payment, null: false, foreign_key: { to_table: :billing_payments }, type: :uuid
      t.string :key, null: false
      t.datetime :expires_at, null: false

      t.timestamps
    end
  end
end
