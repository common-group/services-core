class CreateBillingCreditCards < ActiveRecord::Migration[6.1]
  def change
    create_table :billing_credit_cards, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true
      t.references :payment, null: false, foreign_key: { to_table: :billing_payments }, type: :uuid
      t.string :gateway, null: false
      t.string :gateway_id, null: false
      t.string :holder_name, null: false
      t.string :bin, null: false
      t.string :last_digits, null: false
      t.string :country, null: false
      t.string :brand, null: false
      t.date :expires_on, null: false
      t.boolean :saved, default: false

      t.timestamps
    end
  end
end
