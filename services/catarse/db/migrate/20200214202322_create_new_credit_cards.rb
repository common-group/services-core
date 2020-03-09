class CreateNewCreditCards < ActiveRecord::Migration
  def change
    create_table :new_credit_cards, id: :uuid do |t|
      t.references :owner, null: false, index: true, polymorphic: true, type: :uuid

      t.string :gateway, null: false
      t.string :gateway_id, null: false, foreign_key: false
      t.string :holder_name, null: false
      t.string :first_digits, null: false
      t.string :last_digits, null: false
      t.string :country_code
      t.string :brand
      t.date :expires_on, null:false
      t.json :metadata, default: '{}'

      t.timestamps null: false
    end
  end
end
